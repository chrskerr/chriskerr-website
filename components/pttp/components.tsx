import { ReactElement, useMemo } from 'react';

import { useLocalStorageState } from './hooks';
import { Timer } from './timing';
import { createWeightsData } from './createWeightsData';
import { availableKettlebells } from './availableKettlebells';

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
	steps: number[];
};

export function BarbellExerciseBlock(props: BarbellExerciseProps) {
	const { label, notes, tempo, storageKey, steps } = props;

	const [value, setValue] = useLocalStorageState(storageKey, 20);
	const weightsData = useMemo(() => createWeightsData(value, steps), [value]);

	return (
		<Container label={label}>
			{!!notes && (
				<ul className="mt-2 mb-4 ml-6 list-disc">
					{notes.map((note, i) => (
						<li key={i} className="mb-1">
							{note}
						</li>
					))}
				</ul>
			)}
			<p className="mb-4">tempo {tempo}</p>
			<div className="flex flex-col items-start gap-4 mb-4 whitespace-pre">
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
			</div>
		</Container>
	);
}
