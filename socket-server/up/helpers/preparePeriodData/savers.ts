import { format } from 'date-fns';
import takeRight from 'lodash/takeRight';
import {
	Balance,
	ChartData,
	redrawAccountId,
	Saver,
	SaverTransaction,
} from '../../../../types/finance';

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

	const sortedStartDates = [...startDates].sort(
		(a, b) => new Date(a).valueOf() - new Date(b).valueOf(),
	);

	const targetStartDates = takeRight(sortedStartDates, 3);

	console.log(savers, saverTransactions);
	return targetStartDates.map(startDate => {
		const redrawBalanceForStartData = balancesWithStartDate.find(
			balance =>
				balance.startDate === startDate &&
				balance.accountId === redrawAccountId,
		);

		return { startDate, Redraw: redrawBalanceForStartData?.balance ?? 0 };
	});
}
