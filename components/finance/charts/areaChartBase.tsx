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
import {
	NameType,
	ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { ContentType } from 'recharts/types/component/Tooltip';

import takeRight from 'lodash/takeRight';

import { ExpensesChartData } from './expensesPerWeek';

type Props = {
	data: ExpensesChartData[];
	categories: string[];
};

const formatNumber = new Intl.NumberFormat('en-AU', {
	style: 'currency',
	currency: 'AUD',
});

const AreaChartBase = memo(function AreaChartBase({
	categories,
	data,
}: Props): ReactElement {
	return (
		<div className="h-[400px]">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					width={200}
					height={400}
					data={takeRight(data, 6)}
					margin={{ right: 50, left: 50 }}
				>
					<XAxis dataKey="startDate" />
					<YAxis tickFormatter={formatNumber.format} />
					<Tooltip content={CustomTooltip} />
					{categories.map((category, i) => (
						<Area
							key={category}
							type="natural"
							dataKey={category}
							stackId={1}
							stroke={getStroke(i, categories.length)}
							fill={getFill(i, categories.length)}
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

const getFill = (i: number, of: number): string =>
	`hsl(${(202 + (360 * i) / of) % 360}, 100%, 70%)`;

const CustomTooltip: ContentType<ValueType, NameType> = ({
	active,
	payload,
	label,
}) => {
	if (active && payload && payload.length) {
		const total = payload.reduce<number>(
			(acc, curr) => acc + Number(curr.value),
			0,
		);

		return (
			<div className="p-4 bg-white border rounded shadow-lg">
				<h3 className="pb-4 text-lg">Week starting: {label}</h3>
				{payload.map(item => (
					<div
						key={item.name}
						className="grid grid-cols-3 justify-items-end"
					>
						<p
							key={item.name}
							style={{ color: item.color }}
							className="pb-1 justify-self-start"
						>
							{item.name}:
						</p>
						<p>{formatNumber.format(Number(item.value))}</p>
						<p>
							{((Number(item.value) / total) * 100).toFixed(1)}%
						</p>
					</div>
				))}
				<p className="pt-3">Total: {formatNumber.format(total)}</p>
			</div>
		);
	}

	return null;
};
