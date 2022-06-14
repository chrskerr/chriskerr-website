import { TransactionWithStart } from '.';

import { UpApiReturn, ChartData } from '../../../../types/finance';
import { isProbablyInvestment, isProbablyTransfer } from '../misc';

const createAccStart = (startDate: string, set: Set<string>) => {
	return [...set].reduce<ChartData>((acc, curr) => ({ ...acc, [curr]: 0 }), {
		startDate,
	});
};

interface ICreateExpensesData {
	startDates: string[];
	transactions: TransactionWithStart[];
	categories: Set<string>;
	parentCategories: Set<string>;
}

export function createExpensesData({
	startDates,
	transactions,
	categories,
	parentCategories,
}: ICreateExpensesData): UpApiReturn['expenses'] {
	return startDates.reduce<{
		all: ChartData[];
		byParent: ChartData[];
		byCategory: ChartData[];
	}>(
		(acc, startDate) => {
			const transactionsForStart = transactions.filter(
				txn =>
					txn.amount < 0 &&
					txn.startDate === startDate &&
					!isProbablyInvestment(txn) &&
					!isProbablyTransfer(txn),
			);

			const all: ChartData[] = [
				...acc.all,
				transactionsForStart.reduce<ChartData>(
					(acc_2, curr) => ({
						...acc_2,
						All: curr.amount / 100 + Number(acc_2['All']),
					}),
					{ startDate, All: 0 },
				),
			];

			const byParent: ChartData[] = [
				...acc.byParent,
				transactionsForStart.reduce<ChartData>((acc_2, curr) => {
					const parentCategory =
						curr.parentCategory || 'Uncategorised';
					return {
						...acc_2,
						[parentCategory]:
							curr.amount / 100 + Number(acc_2[parentCategory]),
					};
				}, createAccStart(startDate, parentCategories)),
			];

			const byCategory: ChartData[] = [
				...acc.byCategory,
				transactionsForStart.reduce<ChartData>((acc_2, curr) => {
					const category = curr.category || 'Uncategorised';
					return {
						...acc_2,
						[category]: curr.amount / 100 + Number(acc_2[category]),
					};
				}, createAccStart(startDate, categories)),
			];

			return {
				all,
				byParent,
				byCategory,
			};
		},
		{
			all: [],
			byParent: [],
			byCategory: [],
		},
	);
}
