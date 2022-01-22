import { ReactElement } from 'react';
import { UpApiReturn } from 'types/finance';
import BalancessPerWeek from './charts/balancesPerWeek';
import ExpensesPerWeek from './charts/expensesPerWeek';

export default function Finance({ data }: { data: UpApiReturn }): ReactElement {
	const { expenses, balances } = data;

	console.log(data);

	return (
		<>
			<ExpensesPerWeek expenses={expenses} />
			<BalancessPerWeek balances={balances} />
		</>
	);
}
