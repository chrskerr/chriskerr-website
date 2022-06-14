import { differenceInSeconds, format } from 'date-fns';

import { Balance, Account, ChartData } from '../../../../types/finance';

interface ICreateBalancesData {
	accounts: Account[];
	balances: Balance[];
}

export function createBalancesData({
	accounts,
	balances,
}: ICreateBalancesData): ChartData[] {
	const startDates = new Set<string>();
	const balancesWithStartDate = balances.map<Balance & { startDate: string }>(
		txn => {
			const startDate = format(txn.createdAt, 'dd/MM/yy');
			startDates.add(startDate);
			return {
				...txn,
				startDate,
			};
		},
	);

	const sortedStartDates = [...startDates].sort((a, b) =>
		differenceInSeconds(new Date(a), new Date(b)),
	);

	return sortedStartDates.map<ChartData>(startDate => {
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
}
