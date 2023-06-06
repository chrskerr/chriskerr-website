import { ReactElement } from 'react';
import { BarbellBasicBlock, BarbellDUPBlock } from '../components/barbell';
import { Container } from '../components/container';
import { Reps } from '../helpers/estimateRepsAdjustedWeight';
import { useDeterministicRange } from '../hooks/randomness';
import { NotEmpty } from '../types';

const benchReps: NotEmpty<Reps> = [3, 5, 5, 6, 8, 12, 20];

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

type Combo = { reps: number; tempo: string };
const availableRehabCombos: NotEmpty<Combo> = [
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
			sets={3}
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
			sets={3}
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
			sets={3}
			tempo={tempo}
			reps={reps}
			min={0}
		/>
	);
}

const squatsReps: NotEmpty<Reps> = [5, 5, 6, 8, 12];

export function Squats(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Barbell Front Squat"
			storageKey="bb-front-squat"
			tempo="3030"
			potentialReps={squatsReps}
			mode="pyramid"
		/>
	);
}

const pullUpReps: NotEmpty<Reps> = [3, 5, 5, 6, 8, 12];

export function PullUps(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Pull Up"
			notes={['Include bodyweight (60kg) in daily min']}
			storageKey="pull-ups"
			tempo="20X0"
			potentialReps={pullUpReps}
			mode="pyramid"
			min={60}
		/>
	);
}

const overheadPressReps: NotEmpty<Reps> = [3, 5, 5, 6, 8, 12];

export function OverheadPress(): ReactElement {
	return (
		<BarbellDUPBlock
			label="Barbell Ovehead Press"
			storageKey="bb-ohp"
			tempo="3030"
			potentialReps={overheadPressReps}
			mode="pyramid"
			min={60}
		/>
	);
}

export function SingleLegCalfRaises(): ReactElement {
	return (
		<BarbellBasicBlock
			label="Single leg calf raises"
			storageKey="sl-calf-raise"
			tempo="3030"
			reps={1000}
			min={0}
			sets={3}
		/>
	);
}

export function MachineCalfRaises(): ReactElement {
	return (
		<BarbellBasicBlock
			label="Machine calf raises"
			storageKey="machine-calf-raise"
			tempo="3030"
			reps={20}
			min={0}
			sets={3}
		/>
	);
}
