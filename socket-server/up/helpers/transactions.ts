import axios from 'axios';

import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config({ path: '.env.local' });

import {
	Transaction,
	UpTransaction,
	UpAccount,
	UpTransactions,
} from '../../../types/finance';
import { TableNames } from '../../migrations';
import { createOrUpdateAccount } from './accounts';
import {
	isDescriptionTransferLike,
	urlBase,
	upApiKeyChris,
	upApiKeyKate,
} from './misc';

async function createOrUpdateTransaction(
	accountId: string,
	txn: UpTransaction,
	knex: Knex,
) {
	const transaction: Omit<Transaction, 'id'> = {
		accountId,
		transactionId: txn.id,
		amount: txn.attributes.amount.valueInBaseUnits,
		category: txn.relationships.category.data?.id,
		parentCategory: txn.relationships.parentCategory.data?.id,
		description: txn.attributes.description,
		createdAt: txn.attributes.createdAt,
		isTransfer:
			!!txn.relationships.transferAccount.data ||
			isDescriptionTransferLike(txn.attributes.description),
	};

	await knex
		.table<Transaction>(TableNames.TRANSACTIONS)
		.insert(transaction)
		.onConflict('transactionId')
		.merge();
}

export const fetchTransactions = async ({
	isChris,
	shouldFetchAll,
	link,
}: {
	isChris: boolean;
	shouldFetchAll: boolean;
	link?: string;
}): Promise<UpTransaction[]> => {
	const res = await axios.get(
		link ||
			urlBase + `/transactions?page[size]=${shouldFetchAll ? 100 : 20}`,
		{
			headers: {
				Authorization: `Bearer ${
					isChris ? upApiKeyChris : upApiKeyKate
				}`,
			},
		},
	);
	const txnData = res.data as UpTransactions;
	const next = txnData.links.next;

	return [
		...txnData.data,
		...(next && shouldFetchAll
			? await fetchTransactions({
					isChris,
					shouldFetchAll,
					link: next,
			  })
			: []),
	];
};

export const upsertAllTransactions = async (
	transactions: UpTransaction[],
	knex: Knex,
): Promise<void> => {
	const accountsIds = [
		...new Set(transactions.map(txn => txn.relationships.account.data.id)),
	];

	const failedAccounts: string[] = [];

	await Promise.all(
		accountsIds.map(async accountId => {
			try {
				const chrisAccountRes = await axios.get(
					urlBase + '/accounts/' + accountId,
					{
						headers: {
							Authorization: `Bearer ${upApiKeyChris}`,
						},
					},
				);
				let account = chrisAccountRes.data.data as
					| UpAccount
					| undefined;
				const isChris = !!account;

				if (!account) {
					const kateAccountRes = await axios.get(
						urlBase + '/accounts/' + accountId,
						{
							headers: {
								Authorization: `Bearer ${upApiKeyKate}`,
							},
						},
					);
					account = kateAccountRes.data.data as UpAccount | undefined;
				}

				if (account) {
					await createOrUpdateAccount({
						id: accountId,
						accountName: account?.attributes.displayName,
						bankName: 'up',
						isChris,
						knex,
					});
				} else {
					failedAccounts.push(accountId);
				}
			} catch (e) {
				failedAccounts.push(accountId);
			}
		}),
	);

	transactions.forEach(async txn => {
		try {
			const accountId = txn.relationships.account.data.id;

			if (failedAccounts.includes(accountId)) {
				return;
			}

			await createOrUpdateTransaction(accountId, txn, knex);
		} catch (e) {
			console.error(e);
		}
	});
};
