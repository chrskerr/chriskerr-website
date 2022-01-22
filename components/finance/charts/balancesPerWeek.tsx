import { ReactElement, useEffect, useState, memo } from 'react';
import { ChartData } from 'types/finance';

import AreaChartBase from './areaChartBase';

const BalancesPerWeek = memo(function BalancessPerWeek({
	balances,
}: {
	balances: ChartData[];
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
		<div className="mt-20">
			<div className="flex items-center justify-between pb-6">
				<h2 className="text-xl">Up Balances by week</h2>
			</div>
			{categories && balances ? (
				<AreaChartBase categories={categories} data={balances} />
			) : (
				<></>
			)}
		</div>
	);
});

export default BalancesPerWeek;
