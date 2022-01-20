import { ReactElement, useEffect, useState, memo } from 'react';
import { Account, ChartData } from 'types/finance';

import AreaChartBase from './areaChartBase';

const BalancesPerWeek = memo(function BalancessPerWeek({
	balances,
	accounts,
}: {
	balances: ChartData[];
	accounts: Account[];
}): ReactElement {
	const [categories, setCategories] = useState<string[]>([]);

	useEffect(() => {
		const newCategories = balances.reduce<string[]>((acc, curr) => {
			const currentCategory =
				accounts.find(({ id }) => id === curr.accountId)?.name ||
				'unknown';
			if (acc.includes(currentCategory)) return acc;
			return [...acc, currentCategory];
		}, []);
		setCategories(newCategories);
	}, [balances]);

	return categories && balances ? (
		<AreaChartBase categories={categories} data={balances} />
	) : (
		<></>
	);
});

export default BalancesPerWeek;
