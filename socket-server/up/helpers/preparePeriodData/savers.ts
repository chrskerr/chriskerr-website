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

	return targetStartDates.map(startDate => {
		const formattedString = startDate.toLocaleDateString();

		const redrawBalanceForStartData = balances.find(
			balance =>
				balance.createdAt.toLocaleDateString() === formattedString &&
				balance.accountId === redrawAccountId,
		);

		const saversForDate = savers.reduce<Record<string, Cents>>(
			(acc, curr) => {
				const balanceAtDate = calculateSaverBalanceAtDate(
					curr.id,
					saverTransactions,
					startDate,
				);
				return {
					...acc,
					[curr.name]: balanceAtDate,
				};
			},
			{},
		);

		return {
			startDate: formattedString,
			Redraw: redrawBalanceForStartData?.balance ?? 0,
			...saversForDate,
		};
	});
}
