import { toDate, addDays, startOfMonth, startOfWeek, subDays } from 'date-fns';
import { TransactionWithStart } from '.';
import { Transaction } from '../../../types';

interface ICreateFormattedTransactionDataReturn {
	transactionsWithStartDate: TransactionWithStart[];
	startDates: string[];
	categories: Set<string>;
	parentCategories: Set<string>;
}

export function createFormattedTransactionData(
	transactions: Transaction[],
	period: 'week' | 'month',
): ICreateFormattedTransactionDataReturn {
	const allStartDates = new Set<string>();
	const categories = new Set<string>();
	const parentCategories = new Set<string>();

	const monthlyDaysOffset = 5;

	function formattedStartOfDate(date: string | Date): string {
		return toDate(
			period === 'week'
				? startOfWeek(new Date(date), {
						weekStartsOn: 1,
				  })
				: subDays(
						startOfMonth(
							addDays(new Date(date), monthlyDaysOffset),
						),
						monthlyDaysOffset,
				  ),
		).toLocaleDateString();
	}

	const transactionsWithStartDate = transactions.map<TransactionWithStart>(
		txn => {
			const startDate = formattedStartOfDate(txn.createdAt);
			allStartDates.add(startDate);
			categories.add(txn.category || 'Uncategorised');
			parentCategories.add(txn.parentCategory || 'Uncategorised');
			return {
				...txn,
				startDate,
			};
		},
	);

	const startDates = [...allStartDates].sort(
		(a, b) => new Date(a).valueOf() - new Date(b).valueOf(),
	);

	return {
		categories,
		parentCategories,
		startDates,
		transactionsWithStartDate,
	};
}
