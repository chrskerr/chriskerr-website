import { ReactElement } from 'react';
import { BarbellBasicBlock, BarbellDUPBlock } from './components/barbell';
import { Container } from './components/container';
import { HIITExerciseBlock } from './components/hiit';
import { KettlebellExerciseBlock } from './components/kettlebell';
import { Reps } from './helpers/estimateRepsAdjustedWeight';
import { useDeterministicRange } from './hooks';

// Chris

const deadliftReps: [Reps, ...Reps[]] = [3, 4, 5, 6, 8, 12];

export function Deadlift(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Deadlift"
			storageKey="deadlift"
			tempo="0030"
			potentialReps={deadliftReps}
		/>
	);
}

const benchReps: [Reps, ...Reps[]] = [3, 4, 5, 5, 6, 8, 15, 20];

export function Bench(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Bench"
			notes={['Ensure elbow lockout at top of press']}
			storageKey="bench"
			tempo="3030"
			potentialReps={benchReps}
		/>
	);
}

const curlsReps: [Reps, ...Reps[]] = [6, 8, 12, 15];

export function Curls(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Dumbbell curls"
			notes={['Weight per db']}
			storageKey="dumbbell-curl"
			tempo="3030"
			potentialReps={curlsReps}
		/>
	);
}

export function TurkishGetUp(): ReactElement {
	return (
		<KettlebellExerciseBlock
			label="TGU"
			storageKey="turkish-get-up"
			scheme="1 rep, 10 rounds EMOM"
		/>
	);
}

export function Swings(): ReactElement {
	const isOneHanded = useDeterministicRange([true, false], 'swings');

	if (isOneHanded) {
		return (
			<KettlebellExerciseBlock
				label="One handed swings"
				storageKey="one-handed-kettlebell-swing"
				scheme="10 reps, 10 rounds EMOM"
			/>
		);
	}

	return (
		<KettlebellExerciseBlock
			label="Swings"
			storageKey="kettlebell-swing"
			scheme="10 reps, 10 rounds EMOM"
		/>
	);
}

export function Warmup(): ReactElement {
	return (
		<Container label="Warmup">
			<p>Ideas:</p>
			<ul className="mt-2 ml-6 list-disc">
				{' '}
				<li>Deep squats with KB to pry open thighs</li>
				<li>Def write some more...</li>
			</ul>
		</Container>
	);
}

export function AssaultBike(): ReactElement {
	return (
		<HIITExerciseBlock
			instructions="1 minute work, 1 minute rest, 16 minutes. Hard effort when pushing."
			label="Assault bike intervals"
			intervalCount={16}
			intervalDurationSeconds={60}
			leftRightLabels={['work', 'rest']}
		/>
	);
}

export function Rowing(): ReactElement {
	return (
		<HIITExerciseBlock
			instructions="20 seconds work, 40 minute rest, 10 minutes. Work out rough calories in 20 seconds and then update this to be calorie target & EMOM instead"
			label="Rowing intervals"
			leftRightLabels={null}
		/>
	);
}

// Kate

type Combo = { reps: number; tempo: string };
const availableRehabCombos: [Combo, ...Combo[]] = [
	{
		reps: 10,
		tempo: '3030',
	},
	{
		reps: 5,
		tempo: '6060',
	},
	{
		reps: 7,
		tempo: '4040',
	},
	{
		reps: 3,
		tempo: '10-0-10-0',
	},
];

export function RdlRehab(): ReactElement {
	const key = 'rdl-rehab';
	const { reps, tempo } = useDeterministicRange(availableRehabCombos, key);

	return (
		<BarbellBasicBlock
			label="Romanian Deadlift"
			storageKey={key}
			sets={2}
			tempo={tempo}
			reps={reps}
		/>
	);
}

export function GoodmorningRehab(): ReactElement {
	const key = 'goodmorning-rehab';
	const { reps, tempo } = useDeterministicRange(availableRehabCombos, key);

	return (
		<BarbellBasicBlock
			label="Goodmorning"
			storageKey={key}
			sets={2}
			tempo={tempo}
			reps={reps}
		/>
	);
}

export function GluteHamRaiseRehab(): ReactElement {
	const key = 'glute-ham-raise-rehab';
	const { reps, tempo } = useDeterministicRange(availableRehabCombos, key);

	return (
		<BarbellBasicBlock
			label="Glute Ham Raises"
			storageKey={key}
			sets={2}
			tempo={tempo}
			reps={reps}
			min={0}
		/>
	);
}
