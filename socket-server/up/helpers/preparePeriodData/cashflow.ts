import { TransactionWithStart } from '.';

import { UpApiReturn, ChartData } from '../../../../types/finance';
import { isProbablyInvestment, isProbablyTransfer } from '../misc';

interface ICreateCashFlowData {
	startDates: string[];
	transactions: TransactionWithStart[];
}

export function createCashFlowData({
	startDates,
	transactions,
}: ICreateCashFlowData): UpApiReturn['cashFlow'] {
	return startDates.map<ChartData>(startDate => {
		const transactionsForStart = transactions.filter(
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
}
