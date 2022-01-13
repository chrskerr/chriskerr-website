import { ReactElement, useState } from 'react';
import { UpApiReturn } from 'types/finance';
import ExpensesPerWeek from './charts/expensesPerWeek';

type TransactionCategories = 'all' | 'category' | 'parent-category';

export default function Finance({ data }: { data: UpApiReturn }): ReactElement {
	const [summariseTransactionsBy, setSummariseTransactionsBy] =
		useState<TransactionCategories>('all');

	const {
		allTransactions,
		transactionsByCategory,
		transactionsByParentCategory,
	} = data;
	let expensesData = allTransactions;
	if (summariseTransactionsBy === 'category')
		expensesData = transactionsByCategory;
	if (summariseTransactionsBy === 'parent-category')
		expensesData = transactionsByParentCategory;

	return (
		<>
			<div>
				<div className="flex items-center justify-between pb-6">
					<h2 className="text-xl">Transactions per week</h2>
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
							<option value="category">Category</option>
							<option value="parent-category">
								Parent Category
							</option>
						</select>
					</label>
				</div>
				<ExpensesPerWeek data={expensesData} />
			</div>
		</>
	);
}
