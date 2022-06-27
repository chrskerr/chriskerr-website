import { UpApiReturn } from '../../../../types/finance';
import { Transaction } from '../../../types';
import { isProbablyTransfer } from '../misc';

export function findUncategorisedTransactions(
	transactions: Transaction[],
): UpApiReturn['uncategorisedTransactions'] {
	return transactions
		.filter(transaction => {
			if (transaction.category || transaction.amount > 0) return false;
			return !isProbablyTransfer(transaction);
		})
		.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())
		.map(({ id, amount, createdAt, description }) => ({
			id,
			amount,
			createdAt: createdAt.toISOString(),
			description,
		}));
}
