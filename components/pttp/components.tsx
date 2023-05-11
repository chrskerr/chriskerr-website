import {
	Dispatch,
	ReactElement,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';

import padStart from 'lodash/padStart';
import padEnd from 'lodash/padEnd';

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

function useLocalStorageState(
	storageKey: string,
	falbackValue: number,
): [number, Dispatch<SetStateAction<number>>] {
	const [value, setValue] = useState(falbackValue);

	useEffect(() => {
		const newValue = localStorage.getItem(storageKey);
		if (newValue && !isNaN(Number(newValue))) {
			setValue(Number(newValue));
		}
	}, []);

	useEffect(() => {
		if (value) {
			localStorage.setItem(storageKey, String(value));
		}
	}, [value]);

	return [value, setValue];
}

function Container({
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

function BarbellExerciseBlock(props: BarbellExerciseProps) {
	const { label, notes, tempo, storageKey, steps } = props;

	const [value, setValue] = useLocalStorageState(storageKey, 0);
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
					onClick={() => setValue(d => d - 7.5)}
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

type Kettlebell = {
	weight: number;
	colour: `#${string}`;
};

const availableKettlebells: Kettlebell[] = [
	{ weight: 16, colour: '#F0B700' },
	{ weight: 20, colour: '#2461E5' },
	{ weight: 24, colour: '#00B44D' },
	{ weight: 28, colour: '#DE1008' },
	{ weight: 32, colour: '#3D2F8F' },
	{ weight: 40, colour: '#14140D' },
];

function KettlebellExerciseBlock(props: KettlebellExerciseProps) {
	const { label, storageKey, scheme } = props;

	const [value, setValue] = useLocalStorageState(storageKey, 16);

	function progress() {
		setValue(d => {
			return (
				availableKettlebells.find(val => val.weight > d)?.weight ?? d
			);
		});
	}

	function deload() {
		setValue(d => {
			return (
				[...availableKettlebells].reverse().find(val => val.weight < d)
					?.weight ?? d
			);
		});
	}

	const backgroundColor =
		availableKettlebells.find(kb => kb.weight === value)?.colour ?? '#000';

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

export function Timer({ showControls = false }: { showControls?: boolean }) {
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [intervalData, setIntervalData] = useState<number | undefined>(
		undefined,
	);

	function start() {
		const startedAt = Date.now();
		const timerCallback = () => {
			setTimeElapsed(Math.floor((Date.now() - startedAt) / 1000));
		};
		setIntervalData(window.setInterval(timerCallback, 250));
	}

	function stop() {
		setTimeElapsed(0);
		window.clearInterval(intervalData);
		setIntervalData(undefined);
	}

	function startStop() {
		if (intervalData) {
			stop();
		} else {
			start();
		}
	}

	function restart() {
		stop();
		start();
	}

	const seconds = timeElapsed % 60;
	const minutes = Math.floor(timeElapsed / 60);

	const timeString = timeElapsed
		? `${minutes}:${padStart(String(seconds), 2, '0')}`
		: '0:00';

	useEffect(() => {
		if (!showControls && !intervalData) start();
	}, [showControls]);

	return (
		<div className="flex items-center">
			<time className="mr-4 text-3xl">{timeString}</time>
			{showControls && (
				<>
					<button className="mr-4 button" onClick={startStop}>
						{intervalData ? 'Stop' : 'Start'}
					</button>
					<button
						className="button"
						onClick={restart}
						disabled={!intervalData}
					>
						Restart
					</button>
				</>
			)}
		</div>
	);
}

function getPlatesString(weight: number, includesBar = true): string {
	let remainingWeight = weight - (includesBar ? 20 : 0);
	let str = '';

	while (remainingWeight > 0) {
		if (str) {
			str += ',';
		}

		if (remainingWeight >= 40) {
			str += ' 20';
			remainingWeight -= 40;
		} else if (remainingWeight >= 30) {
			str += ' 15';
			remainingWeight -= 30;
		} else if (remainingWeight >= 20) {
			str += ' 10';
			remainingWeight -= 20;
		} else if (remainingWeight >= 10) {
			str += ' 5';
			remainingWeight -= 10;
		} else if (remainingWeight >= 5) {
			str += ' 2.5';
			remainingWeight -= 5;
		} else if (remainingWeight >= 2.5) {
			str += ' 1.25';
			remainingWeight -= 2.5;
		} else {
			remainingWeight = 0;
		}
	}

	return str.trim();
}

type WeightsData = {
	plates: string;
	weights: { label: string; value: string }[];
};

function createWeightsData(weight: number, steps: number[]): WeightsData {
	const stepWeights = steps.sort().map(step => to2dot5(weight * step));

	let str = '';

	for (let i = 0; i < stepWeights.length; i++) {
		const step = steps[i];
		const stepWeight = stepWeights[i];
		const prevWeight = stepWeights[i - 1];
		if (step && stepWeight) {
			if (i === 0) {
				str += padEnd(` ${step * 100}%:`, 9, ' ');
			} else {
				str += '\n';
				str += padEnd(` ${step * 100}%:`, 7, ' ') + '+ ';
			}

			str += prevWeight
				? getPlatesString(stepWeight - prevWeight, false)
				: getPlatesString(stepWeight);
		}
	}

	return {
		weights: stepWeights
			.map((weight, i) => ({
				label: `${(steps[i] ?? 0) * 100}%`,
				value: `${weight}kg`,
			}))
			.reverse(),
		plates: str,
	};
}

function to2dot5(input: number): number {
	return (Math.round((input * 4) / 10) / 4) * 10;
}
