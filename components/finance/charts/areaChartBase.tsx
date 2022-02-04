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
import { DisplayModes } from '..';

type Props = {
	data: ChartData[];
	categories: string[];
	shouldDisplayAverage?: boolean;
	displayMode: DisplayModes;
};

const formatNumber = new Intl.NumberFormat('en-AU', {
	style: 'currency',
	currency: 'AUD',
});

const averageKey = 'Average';

const AreaChartBase = memo(function AreaChartBase({
	categories,
	data,
	shouldDisplayAverage = true,
	displayMode,
}: Props): ReactElement {
	const preparedData = limitData(
		createMovingAverage(sortData(data), shouldDisplayAverage),
	);

	return (
		<div className="h-[400px]">
			<ResponsiveContainer width="100%" height="100%">
				<ComposedChart
					width={200}
					height={400}
					data={preparedData}
					margin={{ right: 50, left: 50 }}
				>
					<XAxis dataKey="startDate" />
					<YAxis
						tickFormatter={formatNumber.format}
						domain={[
							(dataMin: number) => dataMin * 1.2,
							(dataMax: number) => dataMax * 1.2,
						]}
					/>
					<Tooltip content={CustomTooltip} />
					{categories.map((category, i) => (
						<Area
							key={category}
							type={displayMode}
							dataKey={category}
							stackId={1}
							stroke={getStroke(i, categories.length + 1)}
							fill={getFill(i, categories.length + 1)}
						/>
					))}
					{categories.length < 10 && <Legend />}
					<Line
						dataKey={averageKey}
						stroke={getStroke(
							categories.length + 1,
							categories.length + 1,
						)}
						type="monotone"
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
			<div className="hidden p-4 bg-white border rounded shadow-lg">
				<h3 className="pb-4 text-lg">Week starting: {label}</h3>
				{payload
					.filter(item => item.value)
					.map(item => (
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
									{(
										(Number(item.value) / total) *
										100
									).toFixed(1)}
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

const sortData = (data: ChartData[]): ChartData[] => {
	return data.sort((a, b) => {
		const splitA = a.startDate.split('/');
		const splitB = b.startDate.split('/');

		const dateA = new Date(
			Number(splitA[2]),
			Number(splitA[1]) - 1,
			Number(splitA[0]),
		).valueOf();
		const dateB = new Date(
			Number(splitB[2]),
			Number(splitB[1]) - 1,
			Number(splitB[0]),
		).valueOf();

		if (!dateA || !dateB) return 0;
		return dateA - dateB;
	});
};

const createMovingAverage = (
	data: ChartData[],
	createMovingAverage: boolean,
): ChartData[] => {
	if (!createMovingAverage) return data;

	const lookBack = 8;

	return data.reduce<ChartData[]>((acc, curr, i) => {
		const start = Math.max(0, i - lookBack);

		const currWithTotal = {
			...curr,
			total: Object.values(curr).reduce<number>((totalAcc, value) => {
				return typeof value === 'number' ? totalAcc + value : totalAcc;
			}, 0),
		};

		const items = [...[...acc].splice(start, i), currWithTotal].filter(
			doesItemHaveData,
		);

		const average =
			items.reduce<number>(
				(averageAcc, item) => averageAcc + Number(item.total),
				0,
			) / items.length;

		return [...acc, { ...currWithTotal, [averageKey]: average || 0 }];
	}, []);
};

const limitData = (data: ChartData[]): ChartData[] => {
	return takeRight(data.filter(doesItemHaveData), 6);
};

const doesItemHaveData = (item: ChartData): boolean => {
	return Object.values(item).some(
		value => typeof value === 'number' && value !== 0,
	);
};
