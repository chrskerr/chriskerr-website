import axios from 'axios';

import { Knex } from 'knex';

import {
	Transaction,
	UpAccount,
	UpTransaction,
	UpTransactions,
} from '../../types';
import { TableNames } from '../../migrations';
import { createOrUpdateAccount } from './accounts';
import {
	isDescriptionTransferLike,
	urlBase,
	upApiKeyChris,
	upApiKeyKate,
} from './misc';

async function createOrUpdateTransaction(txns: UpTransaction[], knex: Knex) {
	const transactions = txns.map<Omit<Transaction, 'id'>>(txn => ({
		accountId: txn.relationships.account.data.id,
		transactionId: txn.id,
		amount: txn.attributes.amount.valueInBaseUnits,
		category: txn.relationships.category.data?.id ?? null,
		parentCategory: txn.relationships.parentCategory.data?.id ?? null,
		description: txn.attributes.description,
		createdAt: txn.attributes.createdAt,
		isTransfer:
			!!txn.relationships.transferAccount.data ||
			isDescriptionTransferLike(txn.attributes.description),
	}));

	await knex
		.table<Transaction>(TableNames.TRANSACTIONS)
		.insert(transactions)
		.onConflict('transactionId')
		.merge();
}

export const fetchTransactions = async ({
	isChris,
	lookBack = 20,
	link,
}: {
	isChris: boolean;
	lookBack: number;
	link?: string;
}): Promise<UpTransaction[]> => {
	if (lookBack <= 0) {
		return [];
	}

	const res = await axios.get(
		link || urlBase + `/transactions?page[size]=${Math.min(lookBack, 100)}`,
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

	const remainingLookback = Math.max(lookBack - 100, 0);

	return [
		...txnData.data,
		...(next && remainingLookback > 0
			? await fetchTransactions({
					isChris,
					lookBack: remainingLookback,
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

	const filteredTransactions = transactions.filter(txn => {
		const accountId = txn.relationships.account.data.id;
		return !failedAccounts.includes(accountId);
	});

	await createOrUpdateTransaction(filteredTransactions, knex);
};
