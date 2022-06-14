import { Knex } from 'knex';
import { Cents, Saver, SaverTransaction } from '../../../types/finance';
import { TableNames } from '../../migrations';

export async function createOrUpdateSaver(
	knex: Knex,
	name: string,
	id?: number,
): Promise<Saver> {
	const [r] = await knex
		.table<Saver>(TableNames.SAVERS)
		.insert({ name, ...(id ? { id } : {}) }, '*');
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
