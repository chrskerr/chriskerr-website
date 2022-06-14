import axios from 'axios';
import { startOfDay } from 'date-fns';

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
	excludeFromCalcs,
}: {
	id: string;
	accountName?: string;
	bankName: Account['bankName'];
	isChris: boolean;
	knex: Knex;
	excludeFromCalcs?: boolean;
}) {
	let name = accountName;

	if (name === 'Spending' && bankName === 'up') {
		name = isChris ? 'Chris Spending' : 'Kate Spending';
	}

	return await knex
		.table<Account>(TableNames.ACCOUNTS)
		.insert({
			id,
			name,
			bankName,
			excludeFromCalcs: excludeFromCalcs || false,
		})
		.onConflict('id')
		.merge()
		.returning('*');
}

export async function insertAccountBalance({
	accountId,
	accountName,
	bankName,
	isChris,
	balance,
	knex,
	excludeFromCalcs,
}: {
	accountId: string;
	accountName: string;
	bankName: Account['bankName'];
	isChris: boolean;
	balance: Cents;
	knex: Knex;
	excludeFromCalcs?: boolean;
}): Promise<void> {
	await createOrUpdateAccount({
		id: accountId,
		accountName,
		bankName,
		isChris,
		knex,
		excludeFromCalcs,
	});

	const createdAt = startOfDay(new Date());
	await knex
		.table<Balance>(TableNames.BALANCES)
		.insert({ accountId, balance, createdAt })
		.onConflict(['accountId', 'createdAt'])
		.merge();
}

export const updateBalances = async (knex: Knex): Promise<void> => {
	if (upApiKeyChris) {
		const fetchRes = await axios.get(urlBase + '/accounts', {
			headers: { Authorization: `Bearer ${upApiKeyChris}` },
		});
		const accounts = fetchRes.data as UpAccounts;

		await Promise.all(
			accounts.data.map(async account => {
				await insertAccountBalance({
					accountId: account.id,
					accountName: account?.attributes.displayName,
					bankName: 'up',
					isChris: true,
					balance: account.attributes.balance.valueInBaseUnits,
					knex,
				});
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
				await insertAccountBalance({
					accountId: account.id,
					accountName: account?.attributes.displayName,
					bankName: 'up',
					isChris: false,
					balance: account.attributes.balance.valueInBaseUnits,
					knex,
				});
			}),
		);
	}
};
