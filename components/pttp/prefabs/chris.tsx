import { ReactElement } from 'react';
import { BarbellDUPBlock } from '../components/barbell';
import { Container } from '../components/container';
import { HIITExerciseBlock } from '../components/hiit';
import { KettlebellExerciseBlock } from '../components/kettlebell';
import { Reps } from '../helpers/estimateRepsAdjustedWeight';
import { useDeterministicRange } from '../hooks/randomness';
import { NotEmpty } from '../types';

// Chris

const deadliftReps: NotEmpty<Reps> = [4, 5, 8];

export function Deadlift(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Deadlift"
			storageKey="deadlift"
			tempo="0030"
			potentialReps={deadliftReps}
			mode="pyramid"
		/>
	);
}

const benchReps: NotEmpty<Reps> = [5, 8, 12, 15];

export function Bench(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Bench"
			notes={['Ensure elbow lockout at top of press']}
			storageKey="bench"
			tempo="3030"
			potentialReps={benchReps}
			mode="pyramid"
		/>
	);
}

const dbBenchReps: NotEmpty<Reps> = [5, 8, 12, 15];

export function DbBench(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Dumbbell Bench"
			notes={['Ensure elbow lockout at top of press']}
			storageKey="db-bench"
			tempo="3030"
			potentialReps={dbBenchReps}
			mode="pyramid"
		/>
	);
}

const curlsReps: NotEmpty<Reps> = [6, 8, 12, 15];

export function DbCurls(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Dumbbell curls"
			notes={['Weight per db']}
			storageKey="dumbbell-curl"
			tempo="3030"
			potentialReps={curlsReps}
			min={5}
			mode="straight"
			step={2.5}
		/>
	);
}

export function CableCurls(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Cable curls"
			storageKey="cable-curl"
			tempo="3030"
			potentialReps={curlsReps}
			min={5}
			mode="straight"
			step={2.5}
		/>
	);
}

export function TurkishGetUp(): ReactElement {
	return (
		<KettlebellExerciseBlock
			label="TGU"
			storageKey="turkish-get-up"
			scheme="1 rep, 10 rounds EMOM"
			leftRightLabels={['right', 'left']}
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
			<ul className="mt-2 ml-6 list-disc">
				<li>POSE skill runthroughs</li>
				<li>5-10 minutes jog</li>
			</ul>
		</Container>
	);
}

export function StairStepper(): ReactElement {
	return (
		<Container label="Stair stepper">
			<p>15 minutes aerobic stepping</p>
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
			instructions="10 cals at 100% effort, rest remainder of interval."
			label="Rowing intervals"
			leftRightLabels={null}
			intervalDurationSeconds={90}
			intervalCount={8}
		/>
	);
}
