import { Express } from 'express';

import crypto from 'crypto';

import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config({ path: '.env.local' });

import { UpWebhook, ReportNabBody, toCents } from '../../../types/finance';
import {
	createOrUpdateAccount,
	getHasAuthHeaders,
	insertAccountBalance,
	isEventType,
	limiter,
	updateAllTransactions,
	updateBalances,
} from '../helpers';

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
				await updateAllTransactions(isChris, false, knex);
			} else {
				console.log('hmac not matched', body);
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.post('/nab/report', limiter, async (req, res, next) => {
		try {
			const hasAuthHeaders = getHasAuthHeaders(req);
			const body = req.body as ReportNabBody | undefined;

			if (hasAuthHeaders && typeof body === 'object') {
				const { loanDollars, savingsDollars } = body;

				const mortgageAccountId = '753061668';
				await createOrUpdateAccount({
					id: mortgageAccountId,
					accountName: 'Mortgage',
					bankName: 'nab',
					isChris: true,
					knex,
				});
				await insertAccountBalance(
					mortgageAccountId,
					toCents(Math.round(loanDollars * 100)),
					knex,
				);

				const savingsAccountId = '753037756';
				await createOrUpdateAccount({
					id: savingsAccountId,
					accountName: 'NAB Savings',
					bankName: 'nab',
					isChris: true,
					knex,
				});
				await insertAccountBalance(
					savingsAccountId,
					toCents(Math.round(savingsDollars * 100)),
					knex,
				);

				await Promise.all([
					updateAllTransactions(true, true, knex),
					updateAllTransactions(false, true, knex),
					updateBalances(knex),
				]);

				res.status(200).end();
			} else {
				res.status(500).end();
			}
		} catch (e) {
			next(e);
		}
	});
}
