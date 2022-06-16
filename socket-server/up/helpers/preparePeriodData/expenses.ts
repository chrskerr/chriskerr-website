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
	).toLocaleDateString();
}

function sortChartData(a: ChartData, b: ChartData): number {
	return new Date(a.startDate).valueOf() - new Date(b.startDate).valueOf();
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
	const cashFlowKey = 'In/Out';

	for (const txn of transactions) {
		if (!isProbablyInvestment(txn) && !isProbablyTransfer(txn)) {
			const startDate = formattedStartOfDate(period, txn.createdAt);

			const current = cashflow.get(startDate) ?? {
				startDate: startDate,
				[cashFlowKey]: 0,
			};
			current[cashFlowKey] =
				txn.amount / 100 + Number(current[cashFlowKey]);
			cashflow.set(startDate, current);

			if (txn.amount < 0) {
				const allCurrent = allExpenses.get(startDate) ?? {
					startDate,
					All: 0,
				};
				allCurrent['All'] =
					txn.amount / 100 + Number(allCurrent['All']);
				allExpenses.set(startDate, allCurrent);

				const category = txn.category ?? 'Uncategorised';
				const categoryCurrent = categoryExpenses.get(startDate) ?? {
					startDate,
				};
				categoryCurrent[category] =
					txn.amount / 100 + Number(categoryCurrent[category] ?? 0);
				categoryExpenses.set(startDate, categoryCurrent);
				allCategories.add(category);

				const parentCategory = txn.parentCategory ?? 'Uncategorised';
				const parentCategoryCurrent = parentCategoryExpenses.get(
					startDate,
				) ?? { startDate };
				parentCategoryCurrent[parentCategory] =
					txn.amount / 100 +
					Number(parentCategoryCurrent[parentCategory] ?? 0);
				parentCategoryExpenses.set(startDate, parentCategoryCurrent);
				allParentCategories.add(category);
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
			all: [...allExpenses.values()].sort(sortChartData),
			byCategory: [...categoryExpenses.values()]
				.map(data => ({ ...emptyCategories, ...data }))
				.sort(sortChartData),
			byParent: [...parentCategoryExpenses.values()]
				.map(data => ({ ...emptyParentCategories, ...data }))
				.sort(sortChartData),
		},

		cashFlow: [...cashflow.values()].sort(sortChartData),
	};
}
