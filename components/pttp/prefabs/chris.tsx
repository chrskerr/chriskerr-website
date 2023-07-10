import { ReactElement } from 'react';
import { BarbellBasicBlock, BarbellDUPBlock } from '../components/barbell';
import { Container } from '../components/container';
import { HIITExerciseBlock } from '../components/hiit';
import { KettlebellExerciseBlock } from '../components/kettlebell';

export function Deadlift(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Deadlift"
			storageKey="deadlift"
			tempo="0020"
			potentialReps={[4, 5, 8]}
			mode="pyramid"
		/>
	);
}

export function Squats(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Barbell Back Squat"
			storageKey="barbell-back-squat"
			tempo="3030"
			potentialReps={[5, 8, 12]}
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
			tempo="31X0"
			potentialReps={[4, 5, 8, 12]}
			mode="pyramid"
		/>
	);
}

export function PullUps(): ReactElement {
	return (
		<BarbellBasicBlock
			label="Pullups"
			notes={['Build to target reps, no sets to failure']}
			storageKey="pull-ups"
			tempo="31X1"
			reps={8}
			sets={3}
			min={0}
		/>
	);
}

export function DbBench(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Dumbbell Bench"
			notes={['Ensure elbow lockout at top of press']}
			storageKey="db-bench"
			tempo="31X0"
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

export function AlternatingCableCurls(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Single arm cable curls"
			storageKey="single-cable-curl"
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
			intervalCount={6}
		/>
	);
}

export function Swings(): ReactElement {
	return (
		<KettlebellExerciseBlock
			label="Swings"
			storageKey="kettlebell-swing"
			scheme="10 reps, 10 rounds EMOM"
			leftRightLabels={['both', 'both']}
		/>
	);
}

export function OneHandedSwings(): ReactElement {
	return (
		<KettlebellExerciseBlock
			label="One handed swings"
			storageKey="one-handed-kettlebell-swing"
			scheme="10 reps, 10 rounds EMOM"
		/>
	);
}

export function Warmup(): ReactElement {
	return (
		<Container label="Warmup">
			<ul className="ml-6 list-disc">
				<li>High rep, slow tempo calf raises</li>
				<li>POSE skill runthroughs</li>
				<li>5-10 minutes jog/cycle/incline walk</li>
			</ul>
		</Container>
	);
}

export function InclineWalking(): ReactElement {
	return (
		<Container label="Incline treadmill walking">
			<ul className="ml-6 list-disc">
				<li>15 minutes aerobic (z1 - z2) steep walking</li>
				<li>Breath holds every 2 mins</li>
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
			instructions="10 cals at 100% effort, rest remainder of interval."
			label="Rowing intervals"
			leftRightLabels={null}
			intervalDurationSeconds={90}
			intervalCount={8}
		/>
	);
}

export function CalfRaiseMachine(): ReactElement {
	return (
		<BarbellBasicBlock
			label="Calf raise manchine"
			storageKey="calf-raise-machine"
			tempo="3131"
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
			reps={40}
			min={0}
			sets={2}
		/>
	);
}

export function PlateSitup(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Plate sit-up"
			storageKey="db-lunge-walk"
			tempo="1010"
			potentialReps={[8, 12, 15]}
			min={0}
			mode="straight"
		/>
	);
}
