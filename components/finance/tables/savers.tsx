import { memo, ReactElement } from 'react';
import { UpApiReturn } from 'types/finance';

interface Props {
	saversData: UpApiReturn['savers'];
}

export default memo(function SaversTable({ saversData }: Props): ReactElement {
	const saversMap = new Map(
		saversData.map(saver => [saver.startDate, saver]),
	);
	const startDates = [...saversMap.keys()];
	const saverNames = saversData.reduce<Set<string>>((acc, curr) => {
		Object.keys(curr).forEach(key => {
			if (key !== 'startDate') acc.add(key);
		});
		return acc;
	}, new Set());

	return (
		<div className="w-full">
			<div className="flex items-center justify-between pb-6">
				<h2 className="text-xl">Savers</h2>
			</div>
			<table className="w-full">
				<thead>
					<tr className="font-bold text-left">
						<th>Saver</th>
						{startDates.map(startDate => (
							<th key={startDate}>{startDate}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{[...saverNames].map(name => {
						return (
							<tr key={name}>
								<td>{name}</td>
								{startDates.map(startDate => {
									const value =
										saversMap.get(startDate)?.[name] ?? 0;
									return (
										<td key={startDate}>
											{format(
												typeof value === 'number'
													? value / 100
													: 0,
											)}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
});

const { format } = new Intl.NumberFormat(`en-AU`, {
	currency: `AUD`,
	style: 'currency',
});
