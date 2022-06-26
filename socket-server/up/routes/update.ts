import { Express } from 'express';

import crypto from 'crypto';

import { Knex } from 'knex';

import {
	ReportNabBody,
	redrawAccountId,
	ISaversTransactBody,
	convertDollarsToCents,
	ISaversCloseBody,
} from '../../../types/finance';
import { UpWebhook } from '../../types';
import {
	getHasAuthHeaders,
	insertAccountBalance,
	isEventType,
	limiter,
	upsertAllTransactions,
	updateBalances,
	fetchTransactions,
} from '../helpers';
import {
	calculateSaverBalanceAtDate,
	closeSaver,
	createOrUpdateSaver,
	createSaverTransaction,
	fetchTransactionsForSaver,
} from '../helpers/savers';

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
					lookBack: 20,
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
							lookBack: 1_000,
						}),
						fetchTransactions({
							isChris: false,
							lookBack: 1_000,
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
						balance: convertDollarsToCents(loanDollars),
						knex,
					}),

					insertAccountBalance({
						accountId: savingsAccountId,
						accountName: 'NAB Savings',
						bankName: 'nab',
						isChris: true,
						balance: convertDollarsToCents(savingsDollars),
						knex,
					}),

					insertAccountBalance({
						accountId: redrawAccountId,
						accountName: 'NAB Redraw',
						bankName: 'nab',
						isChris: true,
						balance: convertDollarsToCents(redrawDollars),
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

	app.post('/savers/transact', limiter, async (req, res, next) => {
		try {
			const hasAuthHeaders = getHasAuthHeaders(req);
			if (!hasAuthHeaders) {
				throw new Error('Not authroised');
			}

			const body = req.body as ISaversTransactBody;

			if (!body.name && !body.id) {
				throw new Error('At least one of name or ID must be specified');
			}

			const saverId =
				body.id ??
				(body.name
					? (await createOrUpdateSaver(knex, body.name))?.id
					: undefined);
			if (!saverId) {
				throw new Error('Unable to find or create saver');
			}

			await createSaverTransaction(
				knex,
				saverId,
				convertDollarsToCents(body.amount),
			);

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.post('/savers/close', limiter, async (req, res, next) => {
		try {
			const hasAuthHeaders = getHasAuthHeaders(req);
			if (!hasAuthHeaders) {
				throw new Error('Not authroised');
			}

			const body = req.body as ISaversCloseBody;
			const saverId = body.id;

			if (!saverId) {
				throw new Error('At least one of name or ID must be specified');
			}

			const transactions = await fetchTransactionsForSaver(knex, saverId);
			const saverBalance = calculateSaverBalanceAtDate(
				saverId,
				transactions,
				null,
			);

			if (saverBalance !== 0) {
				throw new Error('Saver balance must be equal to zero');
			}

			const didClose = await closeSaver(knex, saverId);
			if (!didClose) {
				throw new Error('Something went wrong closing saver');
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});
}
