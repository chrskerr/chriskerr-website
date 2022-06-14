import {
	Balance,
	Transaction,
	Account,
	UpApiReturn,
	Saver,
	SaverTransaction,
} from '../../../../types/finance';
import { createBalancesData } from './balances';
import { createCashFlowData } from './cashflow';
import { createExpensesData } from './expenses';
import { createSaversData } from './savers';
import { createFormattedTransactionData } from './transactions';

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
	const {
		startDates,
		transactionsWithStartDate,
		categories,
		parentCategories,
	} = createFormattedTransactionData(transactions, period);

	return {
		expenses: createExpensesData({
			startDates,
			transactions: transactionsWithStartDate,
			categories,
			parentCategories,
		}),
		cashFlow: createCashFlowData({
			startDates,
			transactions: transactionsWithStartDate,
		}),
		balances: createBalancesData({ accounts, balances }),
		savers: createSaversData({ savers, balances, saverTransactions }),
	};
}
