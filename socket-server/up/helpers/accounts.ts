import axios from 'axios';

import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config({ path: '.env.local' });

import { Account, Balance, Cents, UpAccounts } from '../../../types/finance';
import { TableNames } from '../../migrations';
import { urlBase, upApiKeyChris, upApiKeyKate } from './misc';

export async function createOrUpdateAccount({
	id,
	accountName = 'Unnamed',
	bankName,
	isChris,
	knex,
}: {
	id: string;
	accountName?: string;
	bankName: Account['bankName'];
	isChris: boolean;
	knex: Knex;
}) {
	let name = accountName;

	if (name === 'Spending' && bankName === 'up') {
		name = isChris ? 'Chris Spending' : 'Kate Spending';
	}

	return await knex
		.table<Account>(TableNames.ACCOUNTS)
		.insert({ id, name, bankName })
		.onConflict('id')
		.merge()
		.returning('*');
}

export async function insertAccountBalance(
	accountId: string,
	balance: Cents,
	knex: Knex,
): Promise<void> {
	await knex
		.table<Balance>(TableNames.BALANCES)
		.insert({ accountId, balance });
}

export const updateBalances = async (knex: Knex): Promise<void> => {
	if (upApiKeyChris) {
		const fetchRes = await axios.get(urlBase + '/accounts', {
			headers: { Authorization: `Bearer ${upApiKeyChris}` },
		});
		const accounts = fetchRes.data as UpAccounts;

		await Promise.all(
			accounts.data.map(async account => {
				await createOrUpdateAccount({
					id: account.id,
					accountName: account?.attributes.displayName,
					bankName: 'up',
					isChris: true,
					knex,
				});
				await insertAccountBalance(
					account.id,
					account.attributes.balance.valueInBaseUnits,
					knex,
				);
			}),
		);
	}

	if (upApiKeyKate) {
		const fetchRes = await axios.get(urlBase + '/accounts', {
			headers: { Authorization: `Bearer ${upApiKeyKate}` },
		});
		const accounts = fetchRes.data as UpAccounts;

		await Promise.all(
			accounts.data.map(async account => {
				await createOrUpdateAccount({
					id: account.id,
					accountName: account?.attributes.displayName,
					bankName: 'up',
					isChris: false,
					knex,
				});
				await insertAccountBalance(
					account.id,
					account.attributes.balance.valueInBaseUnits,
					knex,
				);
			}),
		);
	}
};
