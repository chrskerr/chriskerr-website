import { ReactElement, useMemo, useState } from 'react';

import { useDeterministicRange, useLocalStorageState } from './hooks';
import { Interval, Timer } from './timing';

import { availableKettlebells } from './helpers/availableKettlebells';
import {
	Reps,
	estimateRepsAdjustedWeight,
} from './helpers/estimateRepsAdjustedWeight';
import { createWeightsData } from './helpers/createWeightsData';

export function Container({
	label,
	children,
}: {
	label: string;
	children: (ReactElement | false)[];
}) {
	return (
		<details className="mb-8 display-width" open>
			<summary className="mb-2 text-2xl">{label}</summary>
			{children}
		</details>
	);
}

type BarbellExerciseProps = {
	label: string;
	notes?: string[];
	tempo: string;
	storageKey: string;
};

export function BarbellExerciseBlock(
	props: BarbellExerciseProps & { potentialReps: [Reps, ...Reps[]] },
) {
	const { label, notes, tempo, storageKey, potentialReps } = props;

	const [dailyMin, setDailyMin] = useLocalStorageState(storageKey, 20);
	const [comfortablyHitDailyMinCount, setComfortablyHitDailyMinCount] =
		useLocalStorageState(`${storageKey}-count`, 0);
	const [hasPressedButton, setHasPressedButton] = useState(false);

	const handleYes = () => {
		setHasPressedButton(true);
		const newCount = comfortablyHitDailyMinCount + 1;
		if (newCount >= 5) {
			setDailyMin(currentDailyMin => currentDailyMin + 5);
			setComfortablyHitDailyMinCount(0);
		} else {
			setComfortablyHitDailyMinCount(newCount);
		}
	};

	const handleNo = () => {
		setHasPressedButton(true);
		setComfortablyHitDailyMinCount(0);
	};

	const handleDeload = () => {
		setHasPressedButton(true);
		setComfortablyHitDailyMinCount(0);
		setDailyMin(currentDailyMin => Math.max(currentDailyMin - 5, 20));
	};

	const reps = useDeterministicRange(potentialReps, storageKey);
	const adjustedWeight = estimateRepsAdjustedWeight(dailyMin, reps);

	return (
		<Container label={label}>
			<p>Structure:</p>
			<ul className="mt-2 mb-4 ml-6 list-disc">
				<li className="mb-1">
					Work up to daily max (a weight which is the best non-grind
					value you can lift today, and will always exceed daily min)
				</li>
				<li className="mb-1">Do 1 set here</li>
				<li className="mb-1">
					Drop the weight by 10-20%, then do back-off sets until tired
				</li>
				<li className="mb-1">
					Increase daily min when confident that the new one will
					always be achievable
				</li>
				<li className="mb-1">Tempo: {tempo}</li>
			</ul>

			{!!notes && (
				<>
					<p>Notes:</p>
					<ul className="mt-2 mb-4 ml-6 list-disc">
						{notes.map((note, i) => (
							<li key={i} className="mb-1">
								{note}
							</li>
						))}
					</ul>
				</>
			)}

			<div className="flex flex-col items-start gap-4 mb-4">
				<div>
					<p>
						Reps: <span className="font-bold">{reps}</span>
					</p>

					<p>
						Daily min:{' '}
						<span className="font-bold">{dailyMin}kg</span>
					</p>

					<p>
						{reps} rep min:{' '}
						<span className="font-bold">{adjustedWeight}kg</span>
					</p>
				</div>
				<p>
					Did you hit daily min comfortably? (current count:{' '}
					{comfortablyHitDailyMinCount})
				</p>
				<div className="grid grid-cols-2 gap-4">
					<button
						className="button"
						onClick={handleYes}
						disabled={hasPressedButton}
					>
						Yes
					</button>
					<button
						className="button"
						onClick={handleNo}
						disabled={hasPressedButton}
					>
						No
					</button>
				</div>
				<button
					className="button"
					onClick={handleDeload}
					disabled={hasPressedButton}
				>
					Deload (-5kg)
				</button>
			</div>
			<Timer showControls />
		</Container>
	);
}

export function BarbellExercisePttpBlock(
	props: BarbellExerciseProps & { steps: number[] },
) {
	const { label, notes, tempo, storageKey, steps } = props;
	const [value, setValue] = useLocalStorageState(storageKey, 20);
	const weightsData = useMemo(() => createWeightsData(value, steps), [value]);

	return (
		<Container label={label}>
			<p>Structure:</p>
			<ul className="mt-2 mb-4 ml-6 list-disc">
				<li className="mb-1">1x5 reps at 100%</li>
				<li className="mb-1">1x5 reps at 90%</li>
				<li className="mb-1">5 reps at 80% until fatigue</li>

				<li className="mb-1">Tempo: {tempo}</li>
			</ul>

			{!!notes && (
				<>
					<p>Notes:</p>
					<ul className="mt-2 mb-4 ml-6 list-disc">
						{notes.map((note, i) => (
							<li key={i} className="mb-1">
								{note}
							</li>
						))}
					</ul>
				</>
			)}

			<div className="flex flex-col items-start gap-4 mb-4">
				<div>
					<p>Plates:</p>
					<p>{weightsData.plates}</p>
				</div>
				{weightsData.weights.map(weight => (
					<div key={weight.label}>
						<p>
							{weight.label}:{' '}
							<span className="font-bold">{weight.value}</span>
						</p>
					</div>
				))}
				<button
					className="button"
					onClick={() => setValue(d => d + 2.5)}
				>
					Progress (+2.5kg)
				</button>
				<button
					className="button"
					onClick={() => setValue(d => Math.max(d - 7.5, 20))}
				>
					Deload (-7.5kg)
				</button>
			</div>
			<Timer showControls />
		</Container>
	);
}

type KettlebellExerciseProps = {
	label: string;
	storageKey: string;
	scheme: string;
};

export function KettlebellExerciseBlock(props: KettlebellExerciseProps) {
	const { label, storageKey, scheme } = props;

	const [value, setValue] = useLocalStorageState(storageKey, 16);

	function progress() {
		setValue(d => {
			const weights = Object.keys(availableKettlebells).sort((a, b) =>
				a.localeCompare(b),
			);
			const nextKb = weights.find(weight => Number(weight) > d);
			return nextKb ? Number(nextKb) : d;
		});
	}

	function deload() {
		setValue(d => {
			const weights = Object.keys(availableKettlebells).sort((a, b) =>
				b.localeCompare(a),
			);
			const prevKb = weights.find(weight => Number(weight) < d);
			return prevKb ? Number(prevKb) : d;
		});
	}

	const backgroundColor = availableKettlebells[String(value)] ?? '#000';

	return (
		<Container label={label}>
			<p className="mb-4">{scheme}</p>

			<div className="flex flex-col items-start gap-4 mb-4 whitespace-pre">
				<div>
					<p>Weight:</p>
					<div className="flex items-center">
						<div
							style={{ backgroundColor }}
							className="w-[24px] mr-2 aspect-square border rounded"
							aria-label={`Kettlebell colour indicator ${backgroundColor}`}
						/>
						<p>{value}kg</p>
					</div>
				</div>

				<button className="button" onClick={progress}>
					Progress
				</button>
				<button className="button" onClick={deload}>
					Deload
				</button>

				<Interval />
			</div>
		</Container>
	);
}
