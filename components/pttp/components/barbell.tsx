import { useMemo, useState, useContext } from 'react';

import { useDeterministicPick } from '../hooks/randomness';

import { DisableClickConstraintContext } from '../context/disableClickConstraint';
import { Timer } from '../timing';

import {
	Reps,
	estimateRepsAdjustedWeight,
} from '../helpers/estimateRepsAdjustedWeight';
import { createWeightsData } from '../helpers/createWeightsData';
import { Container } from './container';
import { NotEmpty } from '../types';
import { useLocalStorageState } from '../hooks/storage';

type BarbellExerciseProps = {
	label: string;
	notes?: string[];
	tempo: string;
	storageKey: string;
	min?: number;
	sets?: number;
	step?: number;
};

export function BarbellBasicBlock(
	props: BarbellExerciseProps & { reps: number },
) {
	const {
		label,
		notes,
		tempo,
		storageKey,
		reps,
		min = 20,
		sets,
		step = 2.5,
	} = props;

	const [weight, setWeight] = useLocalStorageState(storageKey, 20);
	const [hasPressedButton, setHasPressedButton] = useState(false);
	const disableClickConstraint = useContext(DisableClickConstraintContext);
	const isButtonDisabled = hasPressedButton && !disableClickConstraint;

	const handleProgress = () => {
		setHasPressedButton(true);
		setWeight(currentDailyMin => currentDailyMin + step);
	};

	const handleDeload = () => {
		setHasPressedButton(true);
		setWeight(currentDailyMin => Math.max(currentDailyMin - step, min));
	};

	return (
		<Container label={label}>
			<p>Structure:</p>
			<ul className="mt-2 mb-4 ml-6 list-disc">
				<li className="mb-1">
					{sets} sets x {reps} reps @ {tempo}
				</li>
				<li className="mb-1">Weight: {weight}kg</li>
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
				<button
					className="button"
					onClick={handleProgress}
					disabled={isButtonDisabled}
				>
					Progress (+{step}kg)
				</button>
				<button
					className="button"
					onClick={handleDeload}
					disabled={isButtonDisabled}
				>
					Deload (-{step}kg)
				</button>
			</div>
			<Timer showControls />
		</Container>
	);
}

export function BarbellDUPBlock(
	props: BarbellExerciseProps & {
		potentialReps: NotEmpty<Reps>;
		mode: 'pyramid' | 'straight';
	},
) {
	const {
		label,
		notes,
		tempo,
		storageKey,
		potentialReps,
		min = 20,
		mode,
		step = 5,
	} = props;

	const [dailyMin, setDailyMin] = useLocalStorageState(storageKey, min);
	const [comfortablyHitDailyMinCount, setComfortablyHitDailyMinCount] =
		useLocalStorageState(`${storageKey}-count`, 0);
	const [hasPressedButton, setHasPressedButton] = useState(false);
	const disableClickConstraint = useContext(DisableClickConstraintContext);
	const isButtonDisabled = hasPressedButton && !disableClickConstraint;

	const handleYes = () => {
		setHasPressedButton(true);
		const newCount = comfortablyHitDailyMinCount + 1;
		if (newCount >= 5) {
			setDailyMin(currentDailyMin => currentDailyMin + step);
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
		setDailyMin(currentDailyMin => Math.max(currentDailyMin - step, min));
	};

	const reps = useDeterministicPick(potentialReps, storageKey);
	const adjustedWeight = estimateRepsAdjustedWeight(dailyMin, reps);

	return (
		<Container label={label}>
			<p>Structure:</p>
			<ul className="mt-2 mb-4 ml-6 list-disc">
				<li className="mb-1">
					Work up to daily max (must not be a grind)
				</li>
				{mode === 'pyramid' && (
					<>
						<li className="mb-1">Do 1 set here</li>
						<li className="mb-1">
							Drop the weight by 10-20%, then do back-off sets
							until tired
						</li>
					</>
				)}
				{mode === 'straight' && (
					<>
						<li className="mb-1">Do 3 sets here</li>
					</>
				)}
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
				<p>Did you hit daily min comfortably?</p>
				<div className="grid grid-cols-2 gap-4">
					<button
						className="button"
						onClick={handleYes}
						disabled={isButtonDisabled}
					>
						Yes
					</button>
					<button
						className="button"
						onClick={handleNo}
						disabled={isButtonDisabled}
					>
						No
					</button>
				</div>
				<button
					className="button"
					onClick={handleDeload}
					disabled={isButtonDisabled}
				>
					Deload (-{step}kg)
				</button>
			</div>
			<Timer showControls />
		</Container>
	);
}

export function BarbellExercisePttpBlock(
	props: Omit<BarbellExerciseProps, 'step'> & { steps: number[] },
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
