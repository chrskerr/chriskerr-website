import { ReactElement } from 'react';
import { UpApiReturn } from 'types/finance';
import BalancessPerWeek from './charts/balances';
import ExpensesPerWeek from './charts/expenses';
import CashFlow from './charts/cashFlow';

export type DisplayModes = 'step' | 'monotone';

interface Props {
	data: UpApiReturn;
	displayMode: DisplayModes;
}

export default function Finance({ data, displayMode }: Props): ReactElement {
	return (
		<>
			<div>
				<CashFlow cashFlow={data.cashFlow} displayMode={displayMode} />
			</div>
			<div className="mt-20">
				<ExpensesPerWeek
					expenses={data.expenses}
					displayMode={displayMode}
				/>
			</div>
			<div className="mt-20">
				<BalancessPerWeek
					balances={data.balances}
					displayMode={displayMode}
				/>
			</div>
		</>
	);
}
