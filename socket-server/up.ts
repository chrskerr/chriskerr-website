import { Express } from 'express';

import axios from 'axios';

import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config({ path: '.env.local' });

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

export default function createUpRoutes(app: Express, knex: Knex): void {
	async function createOrUpdateAccount(id: string, name = 'unnamed') {
		let r = await knex
			.table(TableNames.ACCOUNTS)
			.where({ id })
			.update({ name })
			.returning('*');
		if (!r || r.length < 1) {
			r = await knex
				.table(TableNames.ACCOUNTS)
				.insert({ id, name })
				.returning('*');
		}
		return r;
	}

	async function insertAccountBalance(
		accountId: string,
		balance: number,
	): Promise<void> {
		await knex.table(TableNames.BALANCES).insert({ accountId, balance });
	}

	async function createTransaction(accountId: string, txn: UpTransaction) {
		return await knex
			.table(TableNames.TRANSACTIONS)
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

	// app.get('/up/ping/:id', async (req, res, next) => {
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

	// app.get('/up/list', async (req, res, next) => {
	// 	try {
	// 		if (apiKey) {
	// 			const fetchRes = await axios.get(urlBase + '/webhooks');
	// 			console.log(fetchRes.data);
	// 		}
	// 		res.status(200).end();
	// 	} catch (e) {
	// 		next(e);
	// 	}
	// });

	// app.get('/up/create/:url', async (req, res, next) => {
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

	// app.get('/up/delete/:id', async (req, res, next) => {
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

	// app.get('/up/txns', async (req, res, next) => {
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

	app.get('/up/balances/:key', async (req, res, next) => {
		try {
			if (upApiKey && req.query.key === apiKey) {
				const fetchRes = await axios.get(urlBase + '/accounts');
				const accounts = fetchRes.data as UpAccounts;

				await Promise.all(
					accounts.data.map(async account => {
						console.log(account.id);
						console.log(account.attributes);
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
		} catch (e) {
			next(e);
		}
	});

	app.post('/up/:key', async (req, res, next) => {
		try {
			const body = req.body as UpWebhook;
			const txnUrl = body.relationships?.transction?.links?.related;
			if (
				body.attributes.eventType === 'TRANSACTION_CREATED' &&
				txnUrl &&
				apiKey
			) {
				const txnData = await axios.get(txnUrl);
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
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});
}

type UpWebhook = {
	id: string;
	attributes: {
		eventType: string;
	};
	relationships: {
		transction: {
			links: {
				related: string;
			};
		};
	};
};

type UpTransaction = {
	data: {
		type: 'transactions';
		id: string;
		attributes: {
			description: string;
			message: null;
			amount: {
				currencyCode: string;
				valueInBaseUnits: number;
			};
			/** ISO8601 date string */
			settledAt: string;
			/** ISO8601 date string */
			createdAt: string;
		};
		relationships: {
			account: {
				data: {
					type: 'accounts';
					id: string;
				};
			};
			category: {
				data: null | { id: string };
			};
			parentCategory: {
				data: null | { id: string };
			};
		};
	};
};

type UpAccounts = {
	data: UpAccount[];
};

type UpAccount = {
	type: 'accounts';
	id: string;
	attributes: {
		displayName: string;
		balance: {
			valueInBaseUnits: number;
		};
	};
};
