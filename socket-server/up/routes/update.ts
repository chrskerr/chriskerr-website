import { Express } from 'express';

import crypto from 'crypto';

import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config({ path: '.env.local' });

import {
	UpWebhook,
	ReportNabBody,
	toCents,
	redrawAccountId,
} from '../../../types/finance';
import {
	getHasAuthHeaders,
	insertAccountBalance,
	isEventType,
	limiter,
	upsertAllTransactions,
	updateBalances,
	fetchTransactions,
} from '../helpers';

const mortgageAccountId = '753061668';
const savingsAccountId = '753037756';

export function createUpUpdateRoutes(app: Express, knex: Knex): void {
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
				const transactions = await fetchTransactions({
					isChris,
					shouldFetchAll: false,
				});
				await upsertAllTransactions(transactions, knex);
			} else {
				console.log('hmac not matched', body);
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.get('/up/update-transactions', limiter, async (req, res, next) => {
		try {
			const hasAuthHeaders = getHasAuthHeaders(req);

			if (hasAuthHeaders) {
				const [chrisTransactions, kateTransactions] = await Promise.all(
					[
						fetchTransactions({
							isChris: true,
							shouldFetchAll: true,
						}),
						fetchTransactions({
							isChris: false,
							shouldFetchAll: true,
						}),
					],
				);

				const seenTransactionIds = new Set<string>();
				const transactions = [
					...chrisTransactions,
					...kateTransactions,
				].filter(({ id }) => {
					if (seenTransactionIds.has(id)) return false;
					seenTransactionIds.add(id);
					return true;
				});

				upsertAllTransactions(transactions, knex);

				res.status(200).end();
			} else {
				res.status(500).end();
			}
		} catch (e) {
			next(e);
		}
	});

	app.post('/nab/report', limiter, async (req, res, next) => {
		try {
			const hasAuthHeaders = getHasAuthHeaders(req);
			const body = req.body as ReportNabBody | undefined;

			if (hasAuthHeaders && typeof body === 'object') {
				const { loanDollars, savingsDollars, redrawDollars } = body;

				await Promise.all([
					insertAccountBalance({
						accountId: mortgageAccountId,
						accountName: 'Mortgage',
						bankName: 'nab',
						isChris: true,
						balance: toCents(Math.round(loanDollars * 100)),
						knex,
					}),

					insertAccountBalance({
						accountId: savingsAccountId,
						accountName: 'NAB Savings',
						bankName: 'nab',
						isChris: true,
						balance: toCents(Math.round(savingsDollars * 100)),
						knex,
					}),

					insertAccountBalance({
						accountId: redrawAccountId,
						accountName: 'NAB Redraw',
						bankName: 'nab',
						isChris: true,
						balance: toCents(Math.round(redrawDollars * 100)),
						knex,
						excludeFromCalcs: true,
					}),
				]);

				await updateBalances(knex);

				res.status(200).end();
			} else {
				res.status(500).end();
			}
		} catch (e) {
			next(e);
		}
	});
}
