import { memo, ReactElement, useEffect, useState } from 'react';
import { TransactionsSummary } from 'types/finance';

import { format } from 'date-fns';
import startCase from 'lodash/startCase';

import AreaChartBase from './areaChartBase';

export type ExpensesChartData = {
	startDate: string;
	[key: string]: number | string;
};

const ExpensesPerWeek = memo(function ExpensesPerWeek({
	data,
}: {
	data: TransactionsSummary[];
}): ReactElement {
	const [categories, setCategories] = useState<string[]>([]);
	const [cleanedData, setCleanedData] = useState<ExpensesChartData[]>([]);

	useEffect(() => {
		const newCategories = data.reduce<string[]>((acc, curr) => {
			const currentCategory = startCase(
				curr.parentCategory || curr.category || 'All',
			);
			if (acc.includes(currentCategory)) return acc;
			return [...acc, currentCategory];
		}, []);
		setCategories(newCategories);

		const dataWithDate = data.map(curr => ({
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
					const currentCategory = startCase(
						curr.parentCategory || curr.category || 'All',
					);

					const existingResult = (
						typeof result[currentCategory] === 'number'
							? result[currentCategory]
							: 0
					) as number;

					result[currentCategory] =
						existingResult + curr.amount / 100;
				});

				return result;
			}),
		);
	}, [data]);

	return categories && cleanedData ? (
		<AreaChartBase categories={categories} data={cleanedData} />
	) : (
		<></>
	);
});

export default ExpensesPerWeek;
