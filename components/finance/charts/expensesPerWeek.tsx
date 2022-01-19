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
	const [filteredData, setFilteredData] = useState<ExpensesChartData[]>([]);

	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [toggleCategoriesShown, setToggleCategoriesShown] = useState(false);

	useEffect(() => {
		const newCategories = data.reduce<string[]>((acc, curr) => {
			const currentCategory = startCase(
				curr.parentCategory || curr.category || 'All',
			);
			if (acc.includes(currentCategory)) return acc;
			return [...acc, currentCategory];
		}, []);
		setCategories(newCategories);
		setSelectedCategories(newCategories);

		const dataWithDate = data.map(curr => ({
			...curr,
			startDate: format(new Date(curr.weekStartOn), 'dd/MM/yy'),
		}));

		const startDates = dataWithDate.reduce<string[]>((acc, curr) => {
			if (acc.includes(curr.startDate)) return acc;
			return [...acc, curr.startDate];
		}, []);

		setCleanedData(
			startDates
				.map<ExpensesChartData>(date => {
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
				})
				.sort((a, b) => {
					const weekStartOnA = dataWithDate.find(
						({ startDate }) => startDate === a.startDate,
					)?.weekStartOn;
					const weekStartOnB = dataWithDate.find(
						({ startDate }) => startDate === b.startDate,
					)?.weekStartOn;

					if (!weekStartOnA || !weekStartOnB) return 0;
					return weekStartOnB > weekStartOnA ? -1 : 1;
				}),
		);
	}, [data]);

	useEffect(() => {
		setFilteredData(
			cleanedData.map(curr => {
				const updated = { ...curr };
				Object.keys(updated).forEach(key => {
					if (key === 'startDate') return;
					if (!selectedCategories.includes(key)) {
						delete updated[key];
					}
				});

				return updated;
			}),
		);
	}, [cleanedData, selectedCategories]);

	return categories && cleanedData ? (
		<>
			<div onClick={() => setToggleCategoriesShown(false)}>
				<button
					className="mb-8 button small"
					onClick={e => {
						e.stopPropagation();
						setToggleCategoriesShown(e => !e);
					}}
				>
					Toggle category selector
				</button>
				<AreaChartBase
					categories={selectedCategories}
					data={filteredData}
				/>
			</div>
			{toggleCategoriesShown && (
				<div className="absolute flex flex-col items-end p-8 bg-white border rounded top-4 right-4">
					<span
						className="-mt-3 text-2xl cursor-pointer font-heading"
						onClick={() => setToggleCategoriesShown(false)}
					>
						x
					</span>
					<div className="grid grid-cols-2">
						{categories &&
							categories.map(category => {
								const isChecked =
									selectedCategories.includes(category);
								const handleChange = () => {
									setSelectedCategories(c => {
										return isChecked
											? c.filter(
													curr => curr !== category,
											  )
											: [...c, category];
									});
								};
								return (
									<div
										key={category}
										className="flex items-center px-2"
									>
										<input
											type="checkbox"
											className="mr-4"
											checked={isChecked}
											onChange={handleChange}
										/>
										<label>{category}</label>
									</div>
								);
							})}
					</div>
				</div>
			)}
		</>
	) : (
		<></>
	);
});

export default ExpensesPerWeek;
