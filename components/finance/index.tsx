import { ReactElement, useState } from 'react';
import { UpApiReturn } from 'types/finance';
import BalancessPerWeek from './charts/balancesPerWeek';
import ExpensesPerWeek from './charts/expensesPerWeek';

type TransactionCategories = 'all' | 'category' | 'parent-category';

export default function Finance({ data }: { data: UpApiReturn }): ReactElement {
	const [summariseTransactionsBy, setSummariseTransactionsBy] =
		useState<TransactionCategories>('parent-category');

	const {
		allTransactions,
		transactionsByCategory,
		transactionsByParentCategory,
		balances,
		accounts,
	} = data;
	let expensesData = allTransactions;
	if (summariseTransactionsBy === 'category')
		expensesData = transactionsByCategory;
	if (summariseTransactionsBy === 'parent-category')
		expensesData = transactionsByParentCategory;

	return (
		<>
			<div>
				<div className="flex items-end justify-between pb-6">
					<h2 className="text-xl">Weekly cash flow</h2>
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
			<div className="mt-20">
				<div className="flex items-center justify-between pb-6">
					<h2 className="text-xl">Up Balances by week</h2>
				</div>
				<BalancessPerWeek balances={balances} accounts={accounts} />
			</div>
		</>
	);
}
