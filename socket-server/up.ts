import { Express, Request } from 'express';

import crypto from 'crypto';

import rateLimit from 'express-rate-limit';
import axios from 'axios';

import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config({ path: '.env.local' });

import { differenceInSeconds, format, startOfWeek } from 'date-fns';

import type {
	Balance,
	Transaction,
	Account,
	UpApiReturn,
	UpTransaction,
	UpAccounts,
	UpWebhook,
	UpAccount,
	ChartData,
} from '../types/finance';

export enum TableNames {
	NOTES = 'notes',
	ACCOUNTS = 'accounts',
	BALANCES = 'account_balances',
	TRANSACTIONS = 'account_transactions',
}

const apiKey = process.env.API_KEY || '';

const upApiKeyChris = process.env.UP_API_KEY;
const upApiKeyKate = process.env.UP_API_KEY_KATE;

const urlBase = 'https://api.up.com.au/api/v1';

const getHasAuthHeaders = (req: Request): boolean =>
	req.headers['api_key'] === apiKey;

const limiter = rateLimit({
	windowMs: 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
});

export default function createUpRoutes(app: Express, knex: Knex): void {
	async function createOrUpdateAccount(
		id: string,
		accountName = 'Unnamed',
		isChris: boolean,
	) {
		let name = accountName;

		if (name === 'Spending') {
			name = isChris ? 'Chris Spending' : 'Kate Spending';
		}

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

	async function createOrUpdateTransaction(
		accountId: string,
		txn: UpTransaction,
	) {
		const transaction: Omit<Transaction, 'id'> = {
			accountId,
			transactionId: txn.data.id,
			amount: txn.data.attributes.amount.valueInBaseUnits,
			category: txn.data.relationships.category.data?.id,
			parentCategory: txn.data.relationships.parentCategory.data?.id,
			description: txn.data.attributes.description,
			createdAt: txn.data.attributes.createdAt,
			isTransfer: !!txn.data.relationships.transferAccount.data?.id,
		};

		const r = await knex
			.table<Transaction>(TableNames.TRANSACTIONS)
			.where({ transactionId: txn.data.id })
			.update(transaction)
			.returning('*');

		if (!r || r.length === 0) {
			await knex
				.table<Transaction>(TableNames.TRANSACTIONS)
				.insert(transaction)
				.returning('*');
		}
	}

	app.set('trust proxy', 1);

	// app.get('/up/ping/:id', limiter, async (req, res, next) => {
	// 	try {
	// 		if (apiKey) {
	// 			const id = req.params.id;
	// 			await axios.post(urlBase + `/webhooks/${id}/ping`, {
	// 				headers: { Authorization: `Bearer ${upApiKey}` },
	// 			});
	// 		}
	// 		res.status(200).end();
	// 	} catch (e) {
	// 		next(e);
	// 	}
	// });

	// app.get('/up/list', limiter, async (req, res, next) => {
	// 	try {
	// 		if (apiKey) {
	// 			const fetchRes = await axios.get(urlBase + '/webhooks', {
	// 				headers: { Authorization: `Bearer ${upApiKey}` },
	// 			});
	// 			fetchRes.data?.data?.forEach(row => {
	// 				console.log(row.id, row.attributes);
	// 			});
	// 		}
	// 		res.status(200).end();
	// 	} catch (e) {
	// 		console.log(e);
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
	// 				headers: { Authorization: `Bearer ${upApiKey}` },
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
	// 				{ headers: { Authorization: `Bearer ${upApiKey}` } },
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
	// 			const fetchRes = await axios.get(urlBase + '/transactions', {
	// 				headers: { Authorization: `Bearer ${upApiKey}` },
	// 			});
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

			if (upApiKeyChris && hasAuthHeaders) {
				const fetchRes = await axios.get(urlBase + '/accounts', {
					headers: { Authorization: `Bearer ${upApiKeyChris}` },
				});
				const accounts = fetchRes.data as UpAccounts;

				await Promise.all(
					accounts.data.map(async account => {
						await createOrUpdateAccount(
							account.id,
							account?.attributes.displayName,
							true,
						);
						await insertAccountBalance(
							account.id,
							account.attributes.balance.valueInBaseUnits,
						);
					}),
				);
			}

			if (upApiKeyKate && hasAuthHeaders) {
				const fetchRes = await axios.get(urlBase + '/accounts', {
					headers: { Authorization: `Bearer ${upApiKeyKate}` },
				});
				const accounts = fetchRes.data as UpAccounts;

				await Promise.all(
					accounts.data.map(async account => {
						await createOrUpdateAccount(
							account.id,
							account?.attributes.displayName,
							false,
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
			const upSigningSecretKate = process.env.UP_SIGNING_SECRET_KATE;

			if (!body || !upSigningSecret || !upSigningSecretKate) {
				console.log('secrets or data missing');
				return res.status(200).end();
			}
			const txnId = body.relationships?.transaction?.data?.id;

			const hashChris = crypto
				.createHmac('sha256', upSigningSecret)
				.update(req.rawBody)
				.digest('hex');

			const hashKate = crypto
				.createHmac('sha256', upSigningSecretKate)
				.update(req.rawBody)
				.digest('hex');

			const upSignature = req.headers['x-up-authenticity-signature'];

			const isChris = hashChris === upSignature;
			const isKate = hashKate === upSignature;

			const eventType = isEventType(body.attributes.eventType)
				? body.attributes.eventType
				: undefined;

			if (eventType && txnId && (isChris || isKate)) {
				const txnData = await axios.get(
					urlBase + '/transactions/' + txnId,
					{
						headers: {
							Authorization: `Bearer ${
								isChris ? upApiKeyChris : upApiKeyKate
							}`,
						},
					},
				);
				const txn = txnData.data as UpTransaction;

				const accountId = txn.data.relationships.account.data.id;

				const accountRes = await axios.get(
					urlBase + '/accounts/' + accountId,
					{
						headers: {
							Authorization: `Bearer ${
								isChris ? upApiKeyChris : upApiKeyKate
							}`,
						},
					},
				);
				const account = accountRes.data.data as UpAccount | undefined;

				await createOrUpdateAccount(
					accountId,
					account?.attributes.displayName,
					isChris,
				);
				await createOrUpdateTransaction(accountId, txn);
			} else {
				console.log('hmac not matched', body);
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.post('/up/report', limiter, async (req, res, next) => {
		try {
			const hasAuthHeaders = getHasAuthHeaders(req);
			const balance = req.body.balance || JSON.parse(req.body).balance;

			if (hasAuthHeaders || typeof balance === 'number') {
				await createOrUpdateAccount('stockspot', 'StockSpot', true);
				await insertAccountBalance('stockspot', balance);
				res.status(200).end();
			} else {
				res.status(500).end();
			}
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
					.select();
				const transactions = await knex
					.table<Transaction>(TableNames.TRANSACTIONS)
					.where({ isTransfer: false })
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

type AcceptedEventTypes = 'TRANSACTION_CREATED' | 'TRANSACTION_SETTLED';

const isEventType = (string: string): string is AcceptedEventTypes => {
	return string === 'TRANSACTION_CREATED' || string === 'TRANSACTION_SETTLED';
};

function createWeeklyData({
	balances,
	accounts,
	transactions,
}: {
	balances: Balance[];
	accounts: Account[];
	transactions: Transaction[];
}): UpApiReturn {
	const allStartDates: string[] = [];
	const allCategories: string[] = [];
	const allParentCategories: string[] = [];

	const transactionsWithStartDate = transactions.map(txn => {
		const startDate = format(
			startOfWeek(new Date(txn.createdAt), {
				weekStartsOn: 1,
			}),
			'dd/MM/yy',
		);
		allStartDates.push(startDate);
		allCategories.push(txn.category || 'Uncategorised');
		allParentCategories.push(txn.parentCategory || 'Uncategorised');
		return {
			...txn,
			startDate,
		};
	});

	const balancesWithStartDate = balances.map<Balance & { startDate: string }>(
		txn => {
			const startDate = format(
				startOfWeek(new Date(txn.createdAt), {
					weekStartsOn: 1,
				}),
				'dd/MM/yy',
			);
			allStartDates.push(startDate);
			return {
				...txn,
				startDate,
			};
		},
	);

	const startDates = [...new Set(allStartDates)].sort((a, b) =>
		differenceInSeconds(new Date(a), new Date(b)),
	);

	const categories = [...new Set(allCategories)];
	const parentCategories = [...new Set(allParentCategories)];

	const createAccStart = (startDate: string, set: string[]) =>
		set.reduce<ChartData>((acc, curr) => ({ ...acc, [curr]: 0 }), {
			startDate,
		});

	const expenses = startDates.reduce<{
		all: ChartData[];
		byParent: ChartData[];
		byCategory: ChartData[];
	}>(
		(acc, startDate) => {
			const transactionsForStart = transactionsWithStartDate.filter(
				txn =>
					txn.amount < 0 &&
					txn.category !== 'investments' &&
					txn.startDate === startDate,
			);

			const all: ChartData[] = [
				...acc.all,
				transactionsForStart.reduce<ChartData>(
					(acc_2, curr) => ({
						...acc_2,
						All: curr.amount / 100 + Number(acc_2['All']),
					}),
					{ startDate, All: 0 },
				),
			];

			const byParent: ChartData[] = [
				...acc.byParent,
				transactionsForStart.reduce<ChartData>((acc_2, curr) => {
					const parentCategory =
						curr.parentCategory || 'Uncategorised';
					return {
						...acc_2,
						[parentCategory]:
							curr.amount / 100 + Number(acc_2[parentCategory]),
					};
				}, createAccStart(startDate, parentCategories)),
			];

			const byCategory: ChartData[] = [
				...acc.byCategory,
				transactionsForStart.reduce<ChartData>((acc_2, curr) => {
					const category = curr.category || 'Uncategorised';
					return {
						...acc_2,
						[category]: curr.amount / 100 + Number(acc_2[category]),
					};
				}, createAccStart(startDate, categories)),
			];

			return {
				all,
				byParent,
				byCategory,
			};
		},
		{
			all: [],
			byParent: [],
			byCategory: [],
		},
	);

	const cashFlow = startDates.map<ChartData>(startDate => {
		const transactionsForStart = transactionsWithStartDate.filter(
			txn =>
				txn.startDate === startDate && txn.category !== 'investments',
		);

		const cashFlowKey = 'In/Out';

		return transactionsForStart.reduce<ChartData>(
			(acc, curr) => ({
				...acc,
				[cashFlowKey]: curr.amount / 100 + Number(acc[cashFlowKey]),
			}),
			{ startDate, [cashFlowKey]: 0 },
		);
	});

	const uniqueBalances = startDates.map<ChartData>(startDate => {
		const balancesForStart = balancesWithStartDate.filter(
			curr => curr.startDate === startDate,
		);
		return accounts
			.map(account => {
				const balancesForAccount = balancesForStart
					.filter(curr => curr.accountId === account.id)
					.sort((a, b) =>
						differenceInSeconds(
							new Date(a.createdAt),
							new Date(b.createdAt),
						),
					);

				return {
					balance: balancesForAccount?.[0]?.balance || 0,
					accountName: account.name,
				};
			})
			.reduce<ChartData>(
				(acc, curr) => ({
					...acc,
					[curr.accountName]: curr.balance / 100,
				}),
				{ startDate },
			);
	});

	return {
		balances: uniqueBalances,
		expenses,
		cashFlow,
	};
}
