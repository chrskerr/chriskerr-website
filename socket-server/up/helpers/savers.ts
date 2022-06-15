import { Knex } from 'knex';
import { Cents, toCents } from '../../../types/finance';
import { Saver, SaverTransaction } from '../../types/postgres';
import { TableNames } from '../../migrations';

export async function createOrUpdateSaver(
	knex: Knex,
	name: string,
	id?: number,
): Promise<Saver> {
	const [r] = await knex
		.table<Saver>(TableNames.SAVERS)
		.insert({ name, ...(id ? { id } : {}) }, '*')
		.onConflict('id')
		.merge();
	return r;
}

export async function createSaverTransaction(
	knex: Knex,
	saverId: number,
	amount: Cents,
): Promise<void> {
	await knex
		.table<SaverTransaction>(TableNames.SAVER_TRANSACTIONS)
		.insert({ saverId, amountCents: amount });
}

export function calculateSaverBalanceAtDate(
	saverId: number,
	transactions: SaverTransaction[],
	cutoffDate: Date | null,
): Cents {
	const cutoffTimestamp = cutoffDate?.valueOf() ?? Infinity;

	return toCents(
		transactions.reduce<number>((acc, curr) => {
			if (
				curr.saverId === saverId &&
				cutoffTimestamp > curr.createdAt.valueOf()
			) {
				return acc + curr.amountCents;
			}

			return acc;
		}, 0),
	);
}

export async function fetchTransactionsForSaver(
	knex: Knex,
	id: number,
): Promise<SaverTransaction[]> {
	return await knex
		.table<SaverTransaction>(TableNames.SAVER_TRANSACTIONS)
		.where({ id })
		.select('*');
}

export async function closeSaver(knex: Knex, id: number): Promise<boolean> {
	const r = await knex
		.table<Saver>(TableNames.SAVERS)
		.where({ id })
		.update({ archivedAt: new Date() }, '*');
	return r.length > 0;
}
