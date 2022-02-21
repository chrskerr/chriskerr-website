import { memo, ReactElement, useEffect, useState } from 'react';
import { ChartData, UpApiReturn } from 'types/finance';

import startCase from 'lodash/startCase';

import AreaChartBase from './areaChartBase';
import { DisplayModes } from '..';

type TransactionCategories = 'all' | 'category' | 'parent-category';

const ExpensesPerWeek = memo(function ExpensesPerWeek({
	expenses,
	displayMode,
}: {
	expenses: UpApiReturn['expenses'];
	displayMode: DisplayModes;
}): ReactElement {
	const [summariseTransactionsBy, setSummariseTransactionsBy] =
		useState<TransactionCategories>('parent-category');

	const [categories, setCategories] = useState<string[]>([]);
	const [filteredData, setFilteredData] = useState<ChartData[]>([]);

	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [toggleCategoriesShown, setToggleCategoriesShown] = useState(false);

	let data = expenses.all;
	if (summariseTransactionsBy === 'category') data = expenses.byCategory;
	if (summariseTransactionsBy === 'parent-category') data = expenses.byParent;

	useEffect(() => {
		const newCategories = data.reduce<string[]>((acc, curr) => {
			const categories = Object.keys(curr)
				.filter(key => key !== 'startDate' && curr[key])
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
					} else if (key !== startCaseKey) {
						updated[startCaseKey] = updated[key];
						delete updated[key];
					}
				});

				return updated;
			}),
		);
	}, [data, selectedCategories]);

	useEffect(() => {
		const closeToggle = () => setToggleCategoriesShown(false);
		window.document.body.addEventListener('click', closeToggle);

		return () => {
			window.document.body.removeEventListener('click', closeToggle);
		};
	}, []);

	return (
		<div className="relative w-full">
			<div className="flex items-end justify-between pb-6">
				<h2 className="text-xl">Expenses</h2>
				<label>
					Summarise by:
					<select
						className="ml-4"
						value={summariseTransactionsBy}
						onChange={e =>
							setSummariseTransactionsBy(
								e.target.value as TransactionCategories,
							)
						}
					>
						<option value="all">All</option>
						<option value="parent-category">Category</option>
						<option value="category">Subcategory</option>
					</select>
				</label>
			</div>
			{categories && filteredData ? (
				<>
					<div className="w-full">
						<div className="flex justify-end w-full">
							<button
								className="mb-8 button small"
								onClick={e => {
									e.stopPropagation();
									setToggleCategoriesShown(true);
								}}
							>
								Show category selector
							</button>
						</div>
						<AreaChartBase
							categories={selectedCategories}
							data={filteredData}
							displayMode={displayMode}
						/>
					</div>
					{toggleCategoriesShown && (
						<div
							className="absolute flex flex-col items-end p-8 bg-white border rounded top-4 right-4"
							onClick={e => e.stopPropagation()}
						>
							<span
								className="-mt-3 text-2xl cursor-pointer font-heading"
								onClick={() => setToggleCategoriesShown(false)}
							>
								x
							</span>
							<div className="grid grid-cols-2">
								<div className="flex items-center px-2">
									<input
										type="checkbox"
										className="mr-4"
										checked={
											selectedCategories.length ===
											categories.length
										}
										onChange={() => {
											if (selectedCategories.length > 0) {
												setSelectedCategories([]);
											} else {
												setSelectedCategories(
													categories,
												);
											}
										}}
										ref={el => {
											if (!el) return;
											if (
												selectedCategories.length > 0 &&
												selectedCategories.length <
													categories.length
											) {
												el.indeterminate = true;
											} else {
												el.indeterminate = false;
											}
										}}
									/>
									<label>All/None</label>
								</div>
								{categories &&
									categories.map(category => {
										const isChecked =
											selectedCategories.includes(
												category,
											);
										const handleChange = () => {
											setSelectedCategories(c => {
												return isChecked
													? c.filter(
															curr =>
																curr !==
																category,
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
			)}
		</div>
	);
});

export default ExpensesPerWeek;
