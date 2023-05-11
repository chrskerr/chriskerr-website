import { useState } from 'react';

import {
	BarbellExerciseBlock,
	Container,
	KettlebellExerciseBlock,
} from './components';

export function Deadlift() {
	return (
		<BarbellExerciseBlock
			label="Deadlift"
			storageKey="deadlift"
			tempo="0030"
			steps={[0.9, 1]}
		/>
	);
}

export function Bench() {
	return (
		<BarbellExerciseBlock
			label="Bench"
			notes={['Ensure elbow lockout at top of press', 'Super-set curls.']}
			storageKey="bench"
			tempo="3030"
			steps={[0.8, 0.9, 1]}
		/>
	);
}

export function TurkishGetUp() {
	return (
		<KettlebellExerciseBlock
			label="TGU"
			storageKey="turkish-get-up"
			scheme="1 rep, 10 rounds EMOM"
		/>
	);
}

export function Swings() {
	const [isOneHanded] = useState(new Date().getDate() % 2 === 0);
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

export function Warmup() {
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
