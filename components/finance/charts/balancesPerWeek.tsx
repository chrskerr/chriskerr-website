import { ReactElement, useEffect, useState, memo } from 'react';
import { Account, BalanceWithStart } from 'types/finance';

import { format } from 'date-fns';

import AreaChartBase from './areaChartBase';

export type ExpensesChartData = {
	startDate: string;
	[key: string]: number | string;
};

const BalancesPerWeek = memo(function BalancessPerWeek({
	balances,
	accounts,
}: {
	balances: BalanceWithStart[];
	accounts: Account[];
}): ReactElement {
	const [categories, setCategories] = useState<string[]>([]);
	const [cleanedData, setCleanedData] = useState<ExpensesChartData[]>([]);

	useEffect(() => {
		const newCategories = balances.reduce<string[]>((acc, curr) => {
			const currentCategory =
				accounts.find(({ id }) => id === curr.accountId)?.name ||
				'unknown';
			if (acc.includes(currentCategory)) return acc;
			return [...acc, currentCategory];
		}, []);
		setCategories(newCategories);

		const dataWithDate = balances.map(curr => ({
			...curr,
			startDate: format(new Date(curr.weekStartOn), 'dd/MM/yy'),
		}));

		const startDates = dataWithDate.reduce<string[]>((acc, curr) => {
			if (acc.includes(curr.startDate)) return acc;
			return [...acc, curr.startDate];
		}, []);

		setCleanedData(
			startDates.map<ExpensesChartData>(date => {
				const dataPoints = dataWithDate.filter(
					({ startDate }) => startDate === date,
				);

				const result: ExpensesChartData = { startDate: date };
				newCategories.forEach(category => (result[category] = 0));

				dataPoints.forEach(curr => {
					const currentCategory =
						accounts.find(({ id }) => id === curr.accountId)
							?.name || 'unknown';

					const existingResult = (
						typeof result[currentCategory] === 'number'
							? result[currentCategory]
							: 0
					) as number;

					result[currentCategory] =
						existingResult + curr.balance / 100;
				});

				return result;
			}),
		);
	}, [balances]);

	return categories && cleanedData ? (
		<AreaChartBase categories={categories} data={cleanedData} />
	) : (
		<></>
	);
});

export default BalancesPerWeek;
