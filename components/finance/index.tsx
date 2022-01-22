import { ReactElement } from 'react';
import { UpApiReturn } from 'types/finance';
import BalancessPerWeek from './charts/balances';
import ExpensesPerWeek from './charts/expenses';
import CashFlow from './charts/cashFlow';

export default function Finance({ data }: { data: UpApiReturn }): ReactElement {
	return (
		<>
			<div>
				<CashFlow cashFlow={data.cashFlow} />
			</div>
			<div className="mt-20">
				<ExpensesPerWeek expenses={data.expenses} />
			</div>
			<div className="mt-20">
				<BalancessPerWeek balances={data.balances} />
			</div>
		</>
	);
}
