import { ReactElement, useEffect, useState } from 'react';
import {
	Area,
	AreaChart,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { TransactionsSummary } from 'types/finance';

import { format } from 'date-fns';
import startCase from 'lodash/startCase';

type ChartData = {
	startDate: string;
	[key: string]: number | string;
};

export default function ExpensesPerWeek({
	data,
}: {
	data: TransactionsSummary[];
}): ReactElement {
	const [categories, setCategories] = useState<string[]>([]);
	const [cleanedData, setCleanedData] = useState<ChartData[]>([]);

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
			startDates.map<ChartData>(date => {
				const dataPoints = dataWithDate.filter(
					({ startDate }) => startDate === date,
				);

				const result: ChartData = { startDate: date };

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

	return (
		<div className="h-[300px]">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					width={200}
					height={300}
					data={cleanedData}
					margin={{ right: 50, left: 50 }}
				>
					<XAxis dataKey="startDate" />
					<YAxis tickFormatter={formatValue} />
					<Tooltip
						formatter={(value: number, name: string) => {
							return [formatValue(Number(value)), name];
						}}
						labelFormatter={(value: string) =>
							`Week starting: ${value}`
						}
					/>
					{categories.map((category, i) => (
						<Area
							key={category}
							type="monotone"
							dataKey={category}
							stackId={1}
							stroke={getStroke(i, categories.length)}
							fill="transparent"
						/>
					))}
					<Legend />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

const formatValue = (value: number): string => {
	return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(2)}`;
};

const getStroke = (i: number, of: number): string =>
	`hsl(${(202 + (360 * i) / of) % 360}, 100%, 37%)`;
