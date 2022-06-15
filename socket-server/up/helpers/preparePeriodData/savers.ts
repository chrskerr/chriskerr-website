import takeRight from 'lodash/takeRight';
import { Cents, ChartData, redrawAccountId } from '../../../../types/finance';
import { Balance, Saver, SaverTransaction } from '../../../types';
import { calculateSaverBalanceAtDate } from '../savers';

interface ICreateSaverData {
	savers: Saver[];
	saverTransactions: SaverTransaction[];
	balances: Balance[];
}

export function createSaversData({
	savers,
	saverTransactions,
	balances,
}: ICreateSaverData): ChartData[] {
	const createdAtDates = new Set<Date>();
	balances.forEach(({ createdAt }) => {
		createdAtDates.add(createdAt);
	});

	const sortedStartDates = [...createdAtDates].sort(
		(a, b) => a.valueOf() - b.valueOf(),
	);

	const targetStartDates = takeRight(sortedStartDates, 3);

	return targetStartDates.map((startDate, i) => {
		const formattedString = startDate.toLocaleDateString();

		let redrawBalanceForStartData =
			balances.find(
				balance =>
					balance.createdAt.toLocaleDateString() ===
						formattedString &&
					balance.accountId === redrawAccountId,
			)?.balance ?? 0;

		const calculationDate = targetStartDates[i + 1] ?? null;

		const saversForDate = savers.reduce<Record<string, Cents>>(
			(acc, curr) => {
				const balanceAtDate = calculateSaverBalanceAtDate(
					curr.id,
					saverTransactions,
					calculationDate,
				);

				redrawBalanceForStartData -= balanceAtDate;

				return {
					...acc,
					[curr.name]: balanceAtDate,
				};
			},
			{},
		);

		return {
			startDate: formattedString,
			Redraw: redrawBalanceForStartData,
			...saversForDate,
		};
	});
}
