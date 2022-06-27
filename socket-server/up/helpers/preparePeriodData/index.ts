import { UpApiReturn } from '../../../../types/finance';
import {
	Account,
	Balance,
	Saver,
	SaverTransaction,
	Transaction,
} from '../../../types';
import { createBalancesData } from './balances';
import { createExpensesData } from './expenses';
import { createSaversData } from './savers';
import { findUncategorisedTransactions } from './transactions';

export type TransactionWithStart = Transaction & { startDate: string };

interface ICreatePeriodicData {
	period: 'week' | 'month';
	balances: Balance[];
	accounts: Account[];
	transactions: Transaction[];
	savers: Saver[];
	saverTransactions: SaverTransaction[];
}

export function createPeriodicData({
	period,
	balances,
	accounts,
	transactions,
	savers,
	saverTransactions,
}: ICreatePeriodicData): UpApiReturn {
	return {
		...createExpensesData(transactions, period),
		balances: createBalancesData({ accounts, balances }),
		savers: createSaversData({ savers, balances, saverTransactions }),
		saverNames: savers.map(saver => ({
			...saver,
			archivedAt: saver.archivedAt?.toISOString() || null,
		})),
		uncategorisedTransactions: findUncategorisedTransactions(transactions),
	};
}
