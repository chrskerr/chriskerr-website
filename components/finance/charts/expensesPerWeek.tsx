import { memo, ReactElement, useEffect, useState } from 'react';
import { ChartData } from 'types/finance';

import startCase from 'lodash/startCase';

import AreaChartBase from './areaChartBase';

const ExpensesPerWeek = memo(function ExpensesPerWeek({
	data,
}: {
	data: ChartData[];
}): ReactElement {
	const [categories, setCategories] = useState<string[]>([]);
	const [filteredData, setFilteredData] = useState<ChartData[]>([]);

	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [toggleCategoriesShown, setToggleCategoriesShown] = useState(false);

	useEffect(() => {
		const newCategories = data.reduce<string[]>((acc, curr) => {
			const categories = Object.keys(curr)
				.filter(key => key !== 'startDate')
				.map(startCase);

			return [...new Set([...acc, ...categories])];
		}, []);
		setCategories(newCategories);
		setSelectedCategories(newCategories);
	}, [data]);

	useEffect(() => {
		setFilteredData(
			data.map(curr => {
				const updated = { ...curr };
				Object.keys(updated).forEach(key => {
					if (key === 'startDate') return;

					const startCaseKey = startCase(key);
					if (!selectedCategories.includes(startCaseKey)) {
						delete updated[key];
					} else {
						updated[startCaseKey] = updated[key];
					}
				});

				return updated;
			}),
		);
	}, [data, selectedCategories]);

	return categories && filteredData ? (
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
