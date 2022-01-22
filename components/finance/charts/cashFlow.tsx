import { memo, ReactElement } from 'react';
import { UpApiReturn } from 'types/finance';
import AreaChartBase from './areaChartBase';

const ExpensesPerWeek = memo(function ExpensesPerWeek({
	cashFlow,
}: {
	cashFlow: UpApiReturn['cashFlow'];
}): ReactElement {
	const categories = cashFlow.reduce<string[]>((acc, curr) => {
		const categories = Object.keys(curr).filter(key => key !== 'startDate');

		return [...new Set([...acc, ...categories])];
	}, []);

	return (
		<div>
			<div className="flex items-center justify-between pb-6">
				<h2 className="text-xl">Cash Flow</h2>
			</div>
			{categories && cashFlow && (
				<AreaChartBase categories={categories} data={cashFlow} />
			)}
		</div>
	);
});

export default ExpensesPerWeek;
