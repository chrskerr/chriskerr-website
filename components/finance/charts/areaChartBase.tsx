import { memo, ReactElement, useEffect, useRef, useState } from 'react';
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
import debounce from 'lodash/debounce';
import startCase from 'lodash/startCase';

import { ChartData } from 'types/finance';
import { DisplayModes, Period } from '..';
import { chartLookbackWeeks } from 'lib/constants';

type Props = {
	data: ChartData[];
	categories: string[];
	shouldDisplayAverage?: boolean;
	displayMode: DisplayModes;
	thresholdLines?: ThresholdLine[];
	yMax?: number;
	yMin?: number;
	period: Period;
};

type ThresholdLine = { label: string; value: number };

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
	thresholdLines = [],
	yMax = Infinity,
	yMin = -Infinity,
	period,
}: Props): ReactElement {
	const $_div = useRef(null);
	const [dataLimit, setDataLimit] = useState(0);
	const [innerWidth, setInnerWidth] = useState(0);

	useEffect(() => {
		const _set = debounce(() => {
			if (!$_div.current) return;
			const { clientWidth } = $_div.current;
			setDataLimit(Math.max(Math.floor(clientWidth / 100), 0));
			setInnerWidth(clientWidth);
		}, 200);
		window.addEventListener('resize', _set);

		setTimeout(_set, 10);

		return () => {
			window.removeEventListener('resize', _set);
		};
	}, []);

	const preparedData = limitData(
		addThresholdLines(
			createMovingAverage(sortData(data), shouldDisplayAverage),
			thresholdLines,
		),
		dataLimit,
	);

	const totalColours = categories.length + thresholdLines.length + 1;

	const CustomTooltip = createCustomTooltip(
		[averageKey, ...thresholdLines.map(({ label }) => label)],
		period,
	);

	return (
		<div ref={$_div} className="h-[400px] w-full">
			{!!dataLimit && !!innerWidth && (
				<ResponsiveContainer width={innerWidth} height="100%">
					<ComposedChart
						data={preparedData}
						margin={{ right: 50, left: 50 }}
					>
						<XAxis dataKey="startDate" />
						<YAxis
							tickFormatter={formatNumber.format}
							domain={[
								(dataMin: number) =>
									Math.max(dataMin * 1.05, yMin),
								(dataMax: number) =>
									Math.min(dataMax * 1.05, yMax),
							]}
							allowDataOverflow
						/>
						{innerWidth > 450 && (
							<Tooltip content={CustomTooltip} />
						)}
						{categories.map((category, i) => (
							<Area
								key={category}
								type={displayMode}
								dataKey={category}
								stackId={1}
								stroke={getStroke(i, totalColours)}
								fill={getFill(i, totalColours)}
							/>
						))}
						{categories.length < 10 && <Legend />}
						{shouldDisplayAverage && (
							<Line
								dataKey={averageKey}
								stroke={getStroke(
									categories.length + 1,
									totalColours,
								)}
								type="monotone"
							/>
						)}
						{thresholdLines.map((line, i) => (
							<Line
								key={line.label}
								dataKey={line.label}
								stroke={getStroke(
									categories.length + 1 + i + 1,
									totalColours,
								)}
								legendType="none"
							/>
						))}
					</ComposedChart>
				</ResponsiveContainer>
			)}
		</div>
	);
});

export default AreaChartBase;

export const getStroke = (i: number, of: number): string =>
	`hsl(${calculateDegrees(i, of)}, 100%, 37%)`;

export const getFill = (i: number, of: number): string =>
	`hsl(${calculateDegrees(i, of)}, 100%, 70%)`;

const calculateDegrees = (i: number, of: number): number =>
	(202 + (360 * i) / (of + 1)) % 360;

const createCustomTooltip = (excludedKeys: string[], period: Period) => {
	const CustomTooltip: ContentType<ValueType, NameType> = ({
		active,
		payload,
		label,
	}) => {
		if (active && payload && payload.length) {
			const total = payload.reduce<number>(
				(acc, curr) =>
					typeof curr.name === 'string' &&
					excludedKeys.includes(curr.name)
						? acc
						: acc + Number(curr.value),
				0,
			);

			return (
				<div className="p-4 bg-white border rounded shadow-lg">
					<h3 className="pb-4 text-lg">
						{startCase(period)} starting: {label}
					</h3>
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
								{!excludedKeys.includes(
									item.name as string,
								) && (
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

	return CustomTooltip;
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

	const lookBack = chartLookbackWeeks;
	const smoothing = 2;

	return data.reduce<ChartData[]>((acc, curr) => {
		const currWithTotal = {
			...curr,
			total: Object.values(curr).reduce<number>((totalAcc, value) => {
				return typeof value === 'number' ? totalAcc + value : totalAcc;
			}, 0),
		};

		const previousPeriod = acc[acc.length - 1];

		const average =
			Number(currWithTotal.total) * (smoothing / (1 + lookBack)) +
			Number(previousPeriod?.[averageKey] || currWithTotal.total) *
				(1 - smoothing / (1 + lookBack));

		return [...acc, { ...currWithTotal, [averageKey]: average || 0 }];
	}, []);
};

const addThresholdLines = (
	data: ChartData[],
	thresholdLines: ThresholdLine[],
): ChartData[] => {
	const linesObject = thresholdLines.reduce<Record<string, number>>(
		(acc, curr) => {
			return {
				...acc,
				[curr.label]: curr.value,
			};
		},
		{},
	);

	return data.map(curr => ({
		...curr,
		...linesObject,
	}));
};

const limitData = (data: ChartData[], limit: number): ChartData[] => {
	return takeRight(data.filter(doesItemHaveData), Math.max(0, limit));
};

const doesItemHaveData = (item: ChartData): boolean => {
	return Object.values(item).some(
		value => typeof value === 'number' && value !== 0,
	);
};
