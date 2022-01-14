import { Express, Request } from 'express';

import crypto from 'crypto';

import rateLimit from 'express-rate-limit';
import axios from 'axios';

import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config({ path: '.env.local' });

import { differenceInSeconds, startOfWeek } from 'date-fns';
import reject from 'lodash/reject';

import type {
	Balance,
	Transaction,
	Account,
	UpApiReturn,
	UpTransaction,
	UpAccounts,
	UpWebhook,
	UpAccount,
	TransactionsSummary,
	BalanceWithStart,
} from '../types/finance';

export enum TableNames {
	NOTES = 'notes',
	ACCOUNTS = 'accounts',
	BALANCES = 'account_balances',
	TRANSACTIONS = 'account_transactions',
}

const apiKey = process.env.API_KEY || '';
const upApiKey = process.env.UP_API_KEY;
const urlBase = 'https://api.up.com.au/api/v1';

axios.defaults.headers.common['Authorization'] = `Bearer ${upApiKey}`;

const getHasAuthHeaders = (req: Request): boolean =>
	req.headers['api_key'] === apiKey;

const limiter = rateLimit({
	windowMs: 1000,
	max: 1,
	standardHeaders: true,
	legacyHeaders: false,
});

export default function createUpRoutes(app: Express, knex: Knex): void {
	async function createOrUpdateAccount(id: string, name = 'unnamed') {
		let r = await knex
			.table<Account>(TableNames.ACCOUNTS)
			.where({ id })
			.update({ name })
			.returning('*');
		if (!r || r.length < 1) {
			r = await knex
				.table<Account>(TableNames.ACCOUNTS)
				.insert({ id, name })
				.returning('*');
		}
		return r;
	}

	async function insertAccountBalance(
		accountId: string,
		balance: number,
	): Promise<void> {
		await knex
			.table<Balance>(TableNames.BALANCES)
			.insert({ accountId, balance });
	}

	async function createTransaction(accountId: string, txn: UpTransaction) {
		return await knex
			.table<Transaction>(TableNames.TRANSACTIONS)
			.insert({
				accountId,
				amount: txn.data.attributes.amount.valueInBaseUnits,
				category: txn.data.relationships.category.data?.id,
				parentCategory: txn.data.relationships.parentCategory.data?.id,
				description: txn.data.attributes.description,
				createdAt: txn.data.attributes.createdAt,
			})
			.returning('*');
	}

	app.set('trust proxy', 1);

	// app.get('/up/ping/:id', limiter, async (req, res, next) => {
	// 	try {
	// 		if (apiKey) {
	// 			const id = req.params.id;
	// 			await axios.post(urlBase + `/webhooks/${id}/ping`);
	// 		}
	// 		res.status(200).end();
	// 	} catch (e) {
	// 		next(e);
	// 	}
	// });

	// app.get('/up/list', limiter, async (req, res, next) => {
	// 	try {
	// 		if (apiKey) {
	// 			const fetchRes = await axios.get(urlBase + '/webhooks');
	// 			fetchRes.data?.data?.forEach(row => {
	// 				console.log(row.id, row.attributes);
	// 			});
	// 		}
	// 		res.status(200).end();
	// 	} catch (e) {
	// 		next(e);
	// 	}
	// });

	// app.get('/up/create/:url', limiter, async (req, res, next) => {
	// 	const url = req.params.url;
	// 	console.log(url);
	// 	try {
	// 		if (apiKey) {
	// 			const fetchRes = await axios.post(urlBase + '/webhooks', {
	// 				data: {
	// 					attributes: {
	// 						url,
	// 					},
	// 				},
	// 			});
	// 			console.log(fetchRes.data);
	// 		}

	// 		res.status(200).end();
	// 	} catch (e) {
	// 		console.log(e.response?.data);
	// 		next(e);
	// 	}
	// });

	// app.get('/up/delete/:id', limiter, async (req, res, next) => {
	// 	const id = req.params.id;
	// 	try {
	// 		if (apiKey) {
	// 			const fetchRes = await axios.delete(
	// 				urlBase + '/webhooks/' + id,
	// 			);
	// 			console.log(fetchRes.data);
	// 		}

	// 		res.status(200).end();
	// 	} catch (e) {
	// 		console.log(e.response?.data);
	// 		next(e);
	// 	}
	// });

	// app.get('/up/txns', limiter, async (req, res, next) => {
	// 	try {
	// 		if (apiKey) {
	// 			const fetchRes = await axios.get(urlBase + '/transactions');
	// 			console.log(fetchRes.data);
	// 		}

	// 		res.status(200).end();
	// 	} catch (e) {
	// 		console.log(e.response?.data);
	// 		next(e);
	// 	}
	// });

	app.get('/up/balances', limiter, async (req, res, next) => {
		try {
			const hasAuthHeaders = getHasAuthHeaders(req);

			if (upApiKey && hasAuthHeaders) {
				const fetchRes = await axios.get(urlBase + '/accounts');
				const accounts = fetchRes.data as UpAccounts;

				await Promise.all(
					accounts.data.map(async account => {
						await createOrUpdateAccount(
							account.id,
							account.attributes.displayName,
						);
						await insertAccountBalance(
							account.id,
							account.attributes.balance.valueInBaseUnits,
						);
					}),
				);
			}
			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.post('/up', limiter, async (req, res, next) => {
		try {
			const body = req.body.data as UpWebhook;
			const upSigningSecret = process.env.UP_SIGNING_SECRET;

			if (!body || !upSigningSecret) return res.status(200).end();

			const txnId = body.relationships?.transaction?.data?.id;

			const hmac = crypto.createHmac('sha256', upSigningSecret);
			hmac.update(req.rawBody);

			const hash = hmac.digest('hex');
			const upSignature = req.headers['x-up-authenticity-signature'];

			if (
				body.attributes.eventType === 'TRANSACTION_CREATED' &&
				txnId &&
				hash === upSignature
			) {
				const txnData = await axios.get(
					urlBase + '/transactions/' + txnId,
				);
				const txn = txnData.data as UpTransaction;

				const accountId = txn.data.relationships.account.data.id;

				const accountRes = await axios.get(
					urlBase + '/accounts/' + accountId,
				);
				const account = accountRes.data.data as UpAccount | undefined;

				await createOrUpdateAccount(
					accountId,
					account?.attributes.displayName,
				);

				const newTransaction = await createTransaction(accountId, txn);
				console.log(newTransaction);
			} else {
				console.log(body);
				console.log('signature matched?', hash === upSignature);
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.get('/up/:period', limiter, async (req, res, next) => {
		try {
			const hasAuth = getHasAuthHeaders(req);
			const period = req.params.period;

			if (hasAuth) {
				const accounts = await knex
					.table<Account>(TableNames.ACCOUNTS)
					.select();
				const balances = await knex
					.table<Balance>(TableNames.BALANCES)
					.select('*');
				const transactions = await knex
					.table<Transaction>(TableNames.TRANSACTIONS)
					.select();

				let result: UpApiReturn | undefined = undefined;

				if (period === 'week') {
					result = createWeeklyData({
						balances,
						accounts,
						transactions,
					});
				}

				if (result) {
					res.status(200).json(result);
				}
			}

			res.status(500).end();
		} catch (e) {
			next(e);
		}
	});
}

function createWeeklyData({
	balances,
	accounts,
	transactions,
}: {
	balances: Balance[];
	accounts: Account[];
	transactions: Transaction[];
}): UpApiReturn {
	const transactionSummaries = transactions.reduce<{
		allTransactions: TransactionsSummary[];
		transactionsByParentCategory: TransactionsSummary[];
		transactionsByCategory: TransactionsSummary[];
	}>(
		(acc, transaction) => {
			const { amount, createdAt, accountId, category, parentCategory } =
				transaction;
			if (!createdAt) return acc;

			const weekStartOn = startOfWeek(new Date(createdAt));

			// All Transactions

			const allFilter = (summary: TransactionsSummary): boolean => {
				return (
					summary.accountId === accountId &&
					summary.weekStartOn === weekStartOn
				);
			};

			const currentAll: TransactionsSummary = acc.allTransactions.find(
				allFilter,
			) || {
				weekStartOn,
				accountId,
				amount: 0,
			};

			const updatedAll = {
				...currentAll,
				amount: currentAll.amount + amount,
			};

			const allTransactions = [
				...reject(acc.allTransactions, allFilter),
				updatedAll,
			];

			// Transactions By Parent Category

			const byParentCategoryFilter = (
				summary: TransactionsSummary,
			): boolean => {
				return (
					summary.accountId === accountId &&
					summary.weekStartOn === weekStartOn &&
					summary.parentCategory === parentCategory
				);
			};

			const currentByParent: TransactionsSummary =
				acc.transactionsByParentCategory.find(
					byParentCategoryFilter,
				) || {
					weekStartOn,
					accountId,
					parentCategory,
					amount: 0,
				};

			const updatedCurrentByParent = {
				...currentByParent,
				amount: currentByParent.amount + amount,
			};

			const transactionsByParentCategory = [
				...reject(
					acc.transactionsByParentCategory,
					byParentCategoryFilter,
				),
				updatedCurrentByParent,
			];

			// Transactions by Category

			const byCategoryFilter = (
				summary: TransactionsSummary,
			): boolean => {
				return (
					summary.accountId === accountId &&
					summary.weekStartOn === weekStartOn &&
					summary.category === category
				);
			};

			const currentByCategory: TransactionsSummary =
				acc.transactionsByCategory.find(byCategoryFilter) || {
					weekStartOn,
					accountId,
					category,
					amount: 0,
				};

			const updatedCurryByCategory = {
				...currentByCategory,
				amount: currentByCategory.amount + amount,
			};

			const transactionsByCategory = [
				...reject(acc.transactionsByCategory, byCategoryFilter),
				updatedCurryByCategory,
			];

			return {
				allTransactions,
				transactionsByParentCategory,
				transactionsByCategory,
			};
		},
		{
			allTransactions: [],
			transactionsByParentCategory: [],
			transactionsByCategory: [],
		},
	);

	const uniqueBalances = balances
		.map(balance => {
			if (balance.createdAt) {
				return {
					...balance,
					weekStartOn: startOfWeek(new Date(balance.createdAt)),
				};
			}
		})
		.filter((balance): balance is BalanceWithStart => !!balance)
		.filter((balance, i, arr) => {
			const balancesForThisWeek = arr
				.filter(
					curr =>
						curr.weekStartOn.valueOf() ===
							balance.weekStartOn.valueOf() &&
						curr.accountId === balance.accountId,
				)
				.sort((a, b) =>
					differenceInSeconds(
						new Date(a.createdAt),
						new Date(b.createdAt),
					),
				);

			return balancesForThisWeek[0].createdAt === balance.createdAt;
		});

	return {
		accounts,
		balances: uniqueBalances,
		...transactionSummaries,
	};
}
