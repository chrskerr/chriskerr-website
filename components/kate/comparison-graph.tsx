import { memo, ReactElement, useEffect, useRef, useState } from 'react';
import {
	Bar,
	ComposedChart,
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
import debounce from 'lodash/debounce';

import { getLabel, IData } from 'lib/kate';
import { getFill, getStroke } from 'components/finance/charts/areaChartBase';

type Props = {
	data: IData[];
};

const ComparisonGraph = memo(function ComparisonGraph({
	data,
}: Props): ReactElement {
	const $_div = useRef(null);
	const [innerWidth, setInnerWidth] = useState(0);

	const [selectedCategories, setSelectedCategories] = useState([
		'Tummy upset',
		'Stress',
	]);

	useEffect(() => {
		const _set = debounce(() => {
			if (!$_div.current) return;
			const { clientWidth } = $_div.current;
			setInnerWidth(clientWidth);
		}, 200);
		window.addEventListener('resize', _set);

		setTimeout(_set, 10);

		return () => {
			window.removeEventListener('resize', _set);
		};
	}, []);

	const { preparedData, categories } = prepareData(data);

	const CustomTooltip = createCustomTooltip();

	return (
		<>
			<div className="grid grid-cols-5 mt-8">
				{categories
					.filter(category => category !== 'stress')
					.map(category => (
						<label key={category}>
							<input
								type="checkbox"
								value={category}
								className="mr-2"
								checked={selectedCategories.includes(category)}
								onChange={() =>
									setSelectedCategories(c =>
										selectedCategories.includes(category)
											? c.filter(cat => cat !== category)
											: [...c, category],
									)
								}
							/>
							{category}
						</label>
					))}
			</div>
			<div
				ref={$_div}
				className="h-[400px] w-full max-w-full overflow-x-scroll mt-8"
			>
				{!!innerWidth && (
					<ResponsiveContainer
						width={
							data.length * (20 * selectedCategories.length + 40)
						}
						height="100%"
					>
						<ComposedChart
							data={preparedData}
							margin={{ top: 10, left: -20 }}
						>
							<XAxis dataKey="id" />
							<YAxis domain={[0, 3]} tickCount={4} />
							<Tooltip content={CustomTooltip} />
							{selectedCategories.map((category, i) => (
								<Bar
									key={category}
									dataKey={category}
									barSize={20}
									stroke={getStroke(
										i,
										selectedCategories.length,
									)}
									fill={getFill(i, selectedCategories.length)}
								/>
							))}
						</ComposedChart>
					</ResponsiveContainer>
				)}
			</div>
		</>
	);
});

export default ComparisonGraph;

function prepareData(data: IData[]): {
	preparedData: Record<string, string | number>[];
	categories: string[];
} {
	const categories: Set<string> = new Set();
	const preparedData = data.map(({ id, ...keys }) => {
		const entries = Object.entries(keys) as [string, number | undefined][];
		const labelledKeys = entries.reduce<Omit<IData, 'id'>>(
			(acc, [index, value]) => {
				const label = getLabel(Number(index));
				if (!label) return acc;

				categories.add(label);
				return {
					...acc,
					[label]: value || 0,
				};
			},
			{},
		);

		return {
			id,
			...labelledKeys,
		};
	});

	return { preparedData, categories: [...categories] };
}

const createCustomTooltip = () => {
	const CustomTooltip: ContentType<ValueType, NameType> = ({
		active,
		payload,
		label,
	}) => {
		if (active && payload && payload.length) {
			return (
				<div className="p-4 bg-white border rounded shadow-lg">
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
								<p>{item.value}</p>
							</div>
						))}
				</div>
			);
		}

		return null;
	};

	return CustomTooltip;
};
