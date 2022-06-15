import { useRouter } from 'next/router';
import { memo, ReactElement, useEffect, useState } from 'react';
import { ISaversTransactBody, toDollars, UpApiReturn } from 'types/finance';

interface Props {
	saversData: UpApiReturn['savers'];
	saverNames: UpApiReturn['saverNames'];
}

const CREATE_SAVER_ID = 'create-new';

interface IGetIsValid {
	chosenSaver: string | undefined;
	newSaverName: string | undefined;
	transferAmount: string;
}

function getIsValid({
	chosenSaver,
	newSaverName,
	transferAmount,
}: IGetIsValid): boolean {
	return (
		!!chosenSaver &&
		(chosenSaver !== CREATE_SAVER_ID || !!newSaverName) &&
		transferAmount !== '0' &&
		!isNaN(parseInt(transferAmount))
	);
}

export default memo(function SaversTable({
	saversData,
	saverNames,
}: Props): ReactElement {
	const router = useRouter();

	const [isMoveMoneyModalOpen, setIsMoveMoneyModalOpen] = useState(false);
	const [chosenSaver, setChosenSaver] = useState<string | undefined>();
	const [newSaverName, setNewSaverName] = useState<string | undefined>();
	const [transferAmount, setTransferAmount] = useState('0');
	const [error, setError] = useState<string | undefined>();
	const [isLoading, setIsLoading] = useState(false);

	const isValid = getIsValid({ chosenSaver, newSaverName, transferAmount });
	const saversMap = new Map(
		saversData.map(saver => [saver.startDate, saver]),
	);
	const startDates = [...saversMap.keys()];

	useEffect(() => {
		if (!chosenSaver) {
			setError('Please choose a saver to transfer to or from');
			return;
		}

		if (chosenSaver === CREATE_SAVER_ID && !newSaverName) {
			setError('Please name your new saver');
			return;
		}

		if (transferAmount === '0' || isNaN(parseInt(transferAmount))) {
			setError('Invalid transfer amount');
			setTransferAmount('0');
			return;
		}

		setError(undefined);
	}, [chosenSaver, newSaverName, transferAmount]);

	async function handleClick() {
		const isValid = getIsValid({
			chosenSaver,
			newSaverName,
			transferAmount,
		});

		if (isLoading || !isValid) return;
		setIsLoading(true);

		const isExistingSaver = !!saverNames.find(
			({ id }) => String(id) === chosenSaver,
		);

		const body: ISaversTransactBody = {
			id: isExistingSaver ? Number(chosenSaver) : null,
			name: isExistingSaver ? null : newSaverName ?? null,
			amount: toDollars(parseInt(transferAmount)),
		};

		await fetch(`/api/finances/savers/transact`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'Application/json' },
			credentials: 'include',
		});

		setNewSaverName(undefined);
		setTransferAmount('0');
		setIsLoading(false);
		setIsMoveMoneyModalOpen(false);
		router.replace(router.asPath);
	}

	return (
		<div className="relative w-full">
			<div className="flex items-center justify-between pb-6">
				<h2 className="text-xl">Savers</h2>
				<button
					className="mb-8 button small"
					onClick={e => {
						e.stopPropagation();
						setIsMoveMoneyModalOpen(true);
					}}
				>
					Move money
				</button>
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
					<tr>
						<td>Redraw</td>
						{startDates.map(startDate => {
							const value = saversMap.get(startDate)?.Redraw ?? 0;
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
					{saverNames.map(({ name, id }) => {
						return (
							<tr key={id}>
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
			{isMoveMoneyModalOpen && (
				<>
					<div
						className="fixed inset-0"
						onClick={() => setIsMoveMoneyModalOpen(false)}
					/>
					<div
						className="absolute flex flex-col items-end p-8 bg-white border rounded top-4 right-4"
						onClick={e => e.stopPropagation()}
					>
						<span
							className="-mt-3 text-2xl cursor-pointer font-heading"
							onClick={() => setIsMoveMoneyModalOpen(false)}
						>
							x
						</span>
						<div className="grid col-span-2 gap-4">
							<label>Saver:</label>
							<select
								value={chosenSaver}
								onChange={e => setChosenSaver(e.target.value)}
							>
								{saverNames.map(({ name, id }) =>
									name === 'Redraw' ? (
										false
									) : (
										<option key={name} value={String(id)}>
											{name}
										</option>
									),
								)}
								<option value={CREATE_SAVER_ID}>
									Create new saver
								</option>
							</select>
							{chosenSaver === CREATE_SAVER_ID && (
								<>
									<label>Add new saver:</label>
									<input
										type="text"
										placeholder="New saver name..."
										value={newSaverName}
										onChange={e =>
											setNewSaverName(e.target.value)
										}
									/>
								</>
							)}
							<label>Amount:</label>
							<input
								type="number"
								step={1}
								value={transferAmount}
								onChange={e =>
									setTransferAmount(e.target.value)
								}
							/>
							{error && (
								<p className="col-span-2 mb-6 font-bold text-red-500 sm:mb-0">
									{error}
								</p>
							)}

							<button
								className="button"
								onClick={handleClick}
								disabled={isLoading || !!error || !isValid}
							>
								Save
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
});

const { format } = new Intl.NumberFormat(`en-AU`, {
	currency: `AUD`,
	style: 'currency',
});