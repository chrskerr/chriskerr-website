import {
	addDays,
	differenceInSeconds,
	format,
	startOfMonth,
	startOfWeek,
	subDays,
} from 'date-fns';

import {
	Balance,
	Transaction,
	Account,
	UpApiReturn,
	ChartData,
} from '../../../types/finance';
import { isProbablyInvestment, isProbablyTransfer } from './misc';

export function createPeriodicData({
	period,
	balances,
	accounts,
	transactions,
}: {
	period: 'week' | 'month';
	balances: Balance[];
	accounts: Account[];
	transactions: Transaction[];
}): UpApiReturn {
	const allStartDates: string[] = [];
	const allCategories: string[] = [];
	const allParentCategories: string[] = [];

	const monthlyDaysOffset = 5;

	function formattedStartOfDate(date: string | Date): string {
		return format(
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
			'dd/MM/yy',
		);
	}

	const transactionsWithStartDate = transactions.map<
		Transaction & { startDate: string }
	>(txn => {
		const startDate = formattedStartOfDate(txn.createdAt);
		allStartDates.push(startDate);
		allCategories.push(txn.category || 'Uncategorised');
		allParentCategories.push(txn.parentCategory || 'Uncategorised');
		return {
			...txn,
			startDate,
		};
	});

	const balancesWithStartDate = balances.map<Balance & { startDate: string }>(
		txn => {
			const startDate = formattedStartOfDate(txn.createdAt);
			allStartDates.push(startDate);
			return {
				...txn,
				startDate,
			};
		},
	);

	const startDates = [...new Set(allStartDates)].sort((a, b) =>
		differenceInSeconds(new Date(a), new Date(b)),
	);

	const categories = [...new Set(allCategories)];
	const parentCategories = [...new Set(allParentCategories)];

	const createAccStart = (startDate: string, set: string[]) =>
		set.reduce<ChartData>((acc, curr) => ({ ...acc, [curr]: 0 }), {
			startDate,
		});

	const expenses = startDates.reduce<{
		all: ChartData[];
		byParent: ChartData[];
		byCategory: ChartData[];
	}>(
		(acc, startDate) => {
			const transactionsForStart = transactionsWithStartDate.filter(
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

	const cashFlow = startDates.map<ChartData>(startDate => {
		const transactionsForStart = transactionsWithStartDate.filter(
			txn =>
				txn.startDate === startDate &&
				!isProbablyInvestment(txn) &&
				!isProbablyTransfer(txn),
		);

		const cashFlowKey = 'In/Out';

		return transactionsForStart.reduce<ChartData>(
			(acc, curr) => ({
				...acc,
				[cashFlowKey]: curr.amount / 100 + Number(acc[cashFlowKey]),
			}),
			{ startDate, [cashFlowKey]: 0 },
		);
	});

	const uniqueBalances = startDates.map<ChartData>(startDate => {
		const balancesForStart = balancesWithStartDate.filter(
			curr => curr.startDate === startDate,
		);
		return accounts
			.map(account => {
				const balancesForAccount = balancesForStart
					.filter(curr => curr.accountId === account.id)
					.sort((a, b) =>
						differenceInSeconds(
							new Date(b.createdAt),
							new Date(a.createdAt),
						),
					);

				return {
					balance: balancesForAccount?.[0]?.balance || 0,
					accountName: account.name,
				};
			})
			.reduce<ChartData>(
				(acc, curr) => ({
					...acc,
					[curr.accountName]:
						curr.balance / 100 +
						(Number(acc[curr.accountName]) || 0),
				}),
				{ startDate },
			);
	});

	return {
		balances: uniqueBalances,
		expenses,
		cashFlow,
	};
}
