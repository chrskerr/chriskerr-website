import { ReactElement } from 'react';
import { UpApiReturn } from 'types/finance';
import BalancessPerWeek from './charts/balances';
import ExpensesPerWeek from './charts/expenses';
import CashFlow from './charts/cashFlow';
import SaversTable from './tables/savers';

export type DisplayModes = 'step' | 'monotone';
export type Period = 'week' | 'month';

interface Props {
	data: UpApiReturn;
	displayMode: DisplayModes;
	period: Period;
	refetchData: () => Promise<void>;
}

export default function Finance({
	data,
	displayMode,
	period,
	refetchData,
}: Props): ReactElement {
	return (
		<>
			<div className="w-full">
				<CashFlow
					cashFlow={data.cashFlow}
					displayMode={displayMode}
					period={period}
				/>
			</div>
			<div className="w-full mt-20">
				<ExpensesPerWeek
					expenses={data.expenses}
					displayMode={displayMode}
					period={period}
				/>
			</div>
			<div className="w-full mt-20">
				<BalancessPerWeek
					balances={data.balances}
					displayMode={displayMode}
					period={period}
				/>
			</div>
			<div className="w-full mt-20">
				<SaversTable
					saversData={data.savers}
					saverNames={data.saverNames}
					refetchdata={refetchData}
				/>
			</div>
		</>
	);
}
