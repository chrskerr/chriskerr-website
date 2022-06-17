import { toDate, addDays, startOfMonth, startOfWeek, subDays } from 'date-fns';

import { UpApiReturn, ChartData } from '../../../../types/finance';
import { isProbablyInvestment, isProbablyTransfer } from '../misc';
import { Transaction } from '../../../types';

const monthlyDaysOffset = 5;

function formattedStartOfDate(
	period: 'month' | 'week',
	date: string | Date,
): string {
	return toDate(
		period === 'week'
			? startOfWeek(new Date(date), {
					weekStartsOn: 1,
			  })
			: subDays(
					startOfMonth(addDays(new Date(date), monthlyDaysOffset)),
					monthlyDaysOffset,
			  ),
	).toLocaleDateString('en-AU');
}

function toSortedFilledArray(
	map: Map<string, ChartData>,
	filler?: Record<string, 0>,
): ChartData[] {
	const sortedData = [...map.values()].sort(
		(a, b) =>
			new Date(a.startDate).valueOf() - new Date(b.startDate).valueOf(),
	);
	return filler
		? sortedData.map(data => ({ ...filler, ...data }))
		: sortedData;
}

interface IUpdateStore {
	key: string;
	set?: Set<string>;
	store: Map<string, ChartData>;
}

function createUpdateFromTxn(
	startDate: string,
	amount: number,
): (data: IUpdateStore) => void {
	return ({ key, set, store }: IUpdateStore): void => {
		const current = store.get(startDate) ?? { startDate };
		current[key] = amount + Number(current[key] ?? 0);
		store.set(startDate, current);
		set?.add(key);
	};
}

export function createExpensesData(
	transactions: Transaction[],
	period: 'week' | 'month',
): { expenses: UpApiReturn['expenses']; cashFlow: UpApiReturn['cashFlow'] } {
	const allExpenses = new Map<string, ChartData>();
	const categoryExpenses = new Map<string, ChartData>();
	const parentCategoryExpenses = new Map<string, ChartData>();

	const allCategories = new Set<string>();
	const allParentCategories = new Set<string>();

	const cashflow = new Map<string, ChartData>();

	for (const txn of transactions) {
		if (!isProbablyInvestment(txn) && !isProbablyTransfer(txn)) {
			const updateFromTxn = createUpdateFromTxn(
				formattedStartOfDate(period, txn.createdAt),
				txn.amount / 100,
			);

			updateFromTxn({ store: cashflow, key: 'In/Out' });

			if (txn.amount < 0) {
				updateFromTxn({ store: allExpenses, key: 'All' });
				updateFromTxn({
					store: categoryExpenses,
					key: txn.category ?? 'Uncategorised',
					set: allCategories,
				});
				updateFromTxn({
					store: parentCategoryExpenses,
					key: txn.parentCategory ?? 'Uncategorised',
					set: allParentCategories,
				});
			}
		}
	}

	const emptyCategories = [...allCategories].reduce<Record<string, 0>>(
		(acc, curr) => ({ ...acc, [curr]: 0 }),
		{},
	);
	const emptyParentCategories = [...allParentCategories].reduce<
		Record<string, 0>
	>((acc, curr) => ({ ...acc, [curr]: 0 }), {});

	return {
		expenses: {
			all: toSortedFilledArray(allExpenses),
			byCategory: toSortedFilledArray(categoryExpenses, emptyCategories),
			byParent: toSortedFilledArray(
				parentCategoryExpenses,
				emptyParentCategories,
			),
		},

		cashFlow: toSortedFilledArray(cashflow),
	};
}
