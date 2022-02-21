import { ReactElement, useEffect, useState, memo } from 'react';
import { ChartData } from 'types/finance';
import { DisplayModes } from '..';

import AreaChartBase from './areaChartBase';

const BalancesPerWeek = memo(function BalancessPerWeek({
	balances,
	displayMode,
}: {
	balances: ChartData[];
	displayMode: DisplayModes;
}): ReactElement {
	const [categories, setCategories] = useState<string[]>([]);

	useEffect(() => {
		const accountNames = balances.reduce<string[]>((acc, curr) => {
			return [
				...new Set([
					...acc,
					...Object.keys(curr).filter(key => key !== 'startDate'),
				]),
			];
		}, []);
		setCategories(accountNames);
	}, [balances]);

	return (
		<div className="w-full">
			<div className="flex items-center justify-between pb-6">
				<h2 className="text-xl">Balances</h2>
			</div>
			{categories && balances ? (
				<AreaChartBase
					categories={categories}
					data={balances}
					shouldDisplayAverage={false}
					displayMode={displayMode}
				/>
			) : (
				<></>
			)}
		</div>
	);
});

export default BalancesPerWeek;
