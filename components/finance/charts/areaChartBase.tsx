import { memo, ReactElement } from 'react';
import {
	Area,
	AreaChart,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { ExpensesChartData } from './expensesPerWeek';

type Props = {
	data: ExpensesChartData[];
	categories: string[];
	labelFormatter: (input: number) => string;
};

const AreaChartBase = memo(function AreaChartBase({
	categories,
	data,
	labelFormatter,
}: Props): ReactElement {
	return (
		<div className="h-[300px]">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					width={200}
					height={300}
					data={data}
					margin={{ right: 50, left: 50 }}
				>
					<XAxis dataKey="startDate" />
					<YAxis tickFormatter={labelFormatter} />
					<Tooltip
						formatter={(value: number, name: string) => {
							return [labelFormatter(Number(value)), name];
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
});

export default AreaChartBase;

const getStroke = (i: number, of: number): string =>
	`hsl(${(202 + (360 * i) / of) % 360}, 100%, 37%)`;
