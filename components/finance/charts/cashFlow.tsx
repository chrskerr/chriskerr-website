import { memo, ReactElement } from 'react';
import { UpApiReturn } from 'types/finance';
import { DisplayModes, Period } from '..';
import AreaChartBase from './areaChartBase';

const ExpensesPerWeek = memo(function ExpensesPerWeek({
	cashFlow,
	displayMode,
	period,
}: {
	cashFlow: UpApiReturn['cashFlow'];
	displayMode: DisplayModes;
	period: Period;
}): ReactElement {
	const categories = cashFlow.reduce<string[]>((acc, curr) => {
		const categories = Object.keys(curr).filter(key => key !== 'startDate');

		return [...new Set([...acc, ...categories])];
	}, []);

	return (
		<div className="w-full">
			<div className="flex items-center justify-between pb-6">
				<h2 className="text-xl">Cash Flow</h2>
			</div>
			{categories && cashFlow && (
				<AreaChartBase
					categories={categories}
					data={cashFlow}
					displayMode={displayMode}
					thresholdLines={[{ label: 'Target', value: 1330 }]}
					yMin={period === 'week' ? -5_000 : -20_000}
				/>
			)}
		</div>
	);
});

export default ExpensesPerWeek;
