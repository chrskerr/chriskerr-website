import { Express } from 'express';

import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config({ path: '.env.local' });

import { startOfWeek, subWeeks } from 'date-fns';

import { UpApiReturn } from '../../../types/finance';
import {
	Balance,
	Transaction,
	Account,
	Saver,
	SaverTransaction,
} from '../../types/postgres';
import { chartLookbackWeeks } from '../../../lib/constants';
import { createPeriodicData, getHasAuthHeaders, limiter } from '../helpers';
import { TableNames } from '../../migrations';

export function createUpFetchRoutes(app: Express, knex: Knex): void {
	app.get('/up/:period', limiter, async (req, res, next) => {
		try {
			const hasAuth = getHasAuthHeaders(req);
			const period = req.params.period;

			let weeksLookback = Math.max(chartLookbackWeeks, 20);
			if (period === 'month') weeksLookback = weeksLookback * 3;

			const fromDate = subWeeks(
				startOfWeek(new Date(), {
					weekStartsOn: 1,
				}),
				weeksLookback,
			);

			if (hasAuth) {
				const [
					accounts,
					balances,
					transactions,
					savers,
					saverTransactions,
				] = await Promise.all([
					knex
						.table<Account>(TableNames.ACCOUNTS)
						.where({ excludeFromCalcs: false })
						.select('*'),
					knex
						.table<Balance>(TableNames.BALANCES)
						.where('createdAt', '>', fromDate)
						.select('*'),
					knex
						.table<Transaction>(TableNames.TRANSACTIONS)
						.where('createdAt', '>', fromDate)
						.select('*'),
					knex
						.table<Saver>(TableNames.SAVERS)
						.where('archivedAt', '==', null)
						.select('*'),
					knex
						.table<SaverTransaction>(TableNames.SAVER_TRANSACTIONS)
						.select('*'),
				]);

				let result: UpApiReturn | undefined = undefined;

				if (period === 'week' || period === 'month') {
					result = createPeriodicData({
						period,
						balances,
						accounts,
						transactions,
						savers,
						saverTransactions,
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
