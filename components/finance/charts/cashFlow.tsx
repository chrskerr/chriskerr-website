import { memo, ReactElement } from 'react';
import { UpApiReturn } from 'types/finance';
import { DisplayModes } from '..';
import AreaChartBase from './areaChartBase';

const ExpensesPerWeek = memo(function ExpensesPerWeek({
	cashFlow,
	displayMode,
}: {
	cashFlow: UpApiReturn['cashFlow'];
	displayMode: DisplayModes;
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
				<AreaChartBase
					categories={categories}
					data={cashFlow}
					displayMode={displayMode}
					thresholdLines={[{ label: 'Mortgage', level: 680 }]}
				/>
			)}
		</div>
	);
});

export default ExpensesPerWeek;
