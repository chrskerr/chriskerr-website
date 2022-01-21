import { memo, ReactElement } from 'react';
import {
	Area,
	ComposedChart,
	Legend,
	Line,
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

import { ChartData } from 'types/finance';

type Props = {
	data: ChartData[];
	categories: string[];
};

const formatNumber = new Intl.NumberFormat('en-AU', {
	style: 'currency',
	currency: 'AUD',
});

const averageKey = 'Average';

const AreaChartBase = memo(function AreaChartBase({
	categories,
	data,
}: Props): ReactElement {
	const dataWithTotals = createMovingAverage(data);

	return (
		<div className="h-[400px]">
			<ResponsiveContainer width="100%" height="100%">
				<ComposedChart
					width={200}
					height={400}
					data={takeRight(dataWithTotals, 6)}
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
							stroke={getStroke(i, categories.length + 1)}
							fill={getFill(i, categories.length + 1)}
						/>
					))}
					<Legend />
					<Line
						dataKey={averageKey}
						stroke={getStroke(
							categories.length + 1,
							categories.length + 1,
						)}
					/>
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
});

export default AreaChartBase;

const getStroke = (i: number, of: number): string =>
	`hsl(${calculateDegrees(i, of)}, 100%, 37%)`;

const getFill = (i: number, of: number): string =>
	`hsl(${calculateDegrees(i, of)}, 100%, 70%)`;

const calculateDegrees = (i: number, of: number): number =>
	(202 + (360 * i) / (of + 1)) % 360;

const CustomTooltip: ContentType<ValueType, NameType> = ({
	active,
	payload,
	label,
}) => {
	if (active && payload && payload.length) {
		const total = payload.reduce<number>(
			(acc, curr) =>
				curr.name === averageKey ? acc : acc + Number(curr.value),
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
						{item.name !== averageKey && (
							<p>
								{((Number(item.value) / total) * 100).toFixed(
									1,
								)}
								%
							</p>
						)}
					</div>
				))}
				<p className="pt-3">Total: {formatNumber.format(total)}</p>
			</div>
		);
	}

	return null;
};

const createMovingAverage = (data: ChartData[]): ChartData[] => {
	const result: ChartData[] = [];
	const lookBack = 8;

	const dataWithTotals = data.map(curr => ({
		...curr,
		total: Object.values(curr).reduce<number>((acc, curr) => {
			return typeof curr === 'number' ? acc + curr : acc;
		}, 0),
	}));

	for (let i = 0; i < dataWithTotals.length; i++) {
		const curr = data[i];

		const start = Math.max(0, i - lookBack);

		const items = [...dataWithTotals].splice(start, i + 1);
		const average =
			items.reduce<number>((acc, curr) => acc + curr.total, 0) /
			items.length;

		result[i] = { ...curr, [averageKey]: average };
	}

	return result;
};
