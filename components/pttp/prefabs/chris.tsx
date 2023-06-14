import { ReactElement } from 'react';
import { BarbellBasicBlock, BarbellDUPBlock } from '../components/barbell';
import { Container } from '../components/container';
import { HIITExerciseBlock } from '../components/hiit';
import { KettlebellExerciseBlock } from '../components/kettlebell';
import { useDeterministicRange } from '../hooks/randomness';

export function Deadlift(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Deadlift"
			storageKey="deadlift"
			tempo="0030"
			potentialReps={[4, 5, 8]}
			mode="pyramid"
		/>
	);
}

export function Bench(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Bench"
			notes={['Ensure elbow lockout at top of press']}
			storageKey="bench"
			tempo="3030"
			potentialReps={[5, 8, 12, 15]}
			mode="pyramid"
		/>
	);
}

export function DbBench(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Dumbbell Bench"
			notes={['Ensure elbow lockout at top of press']}
			storageKey="db-bench"
			tempo="3030"
			potentialReps={[5, 8, 12, 15]}
			mode="pyramid"
		/>
	);
}

export function DbCurls(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Dumbbell curls"
			notes={['Weight per db']}
			storageKey="dumbbell-curl"
			tempo="3030"
			potentialReps={[6, 8, 12, 15]}
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
			potentialReps={[6, 8, 12, 15]}
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
			scheme="2 rep, 6 rounds EMOM"
			leftRightLabels={['right', 'left']}
			intervalDurationSeconds={90}
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

export function SingleLegCalfRaises(): ReactElement {
	return (
		<BarbellBasicBlock
			label="Single leg calf raises"
			storageKey="sl-calf-raise"
			tempo="3030"
			reps={20}
			min={0}
			sets={3}
		/>
	);
}

export function LungeWalking(): ReactElement {
	return (
		<BarbellBasicBlock
			label="DB lunge walking (reps = steps)"
			storageKey="db-lunge-walk"
			tempo="1010"
			reps={20}
			min={0}
			sets={3}
		/>
	);
}
