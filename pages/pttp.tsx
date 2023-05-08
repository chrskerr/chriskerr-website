import {
	Dispatch,
	ReactElement,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';

import { NextSeo } from 'next-seo';
import padStart from 'lodash/padStart';
import padEnd from 'lodash/padEnd';

const title = 'PTTP tracker';

export default function EMDR(): ReactElement {
	return (
		<>
			<NextSeo
				title={title}
				description={title}
				canonical="https://www.chriskerr.dev/pttp"
				noindex
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<Timer showControls={false} />
			</div>
			<div className="display-width divider-before" />

			<KettlebellExerciseBlock
				label="TGU"
				storageKey="turkish-get-up"
				scheme="1 rep, 10 rounds EMOM"
				className="mb-8"
			/>
			<KettlebellExerciseBlock
				label="Swings"
				storageKey="kettlebell-swing"
				scheme="10 reps, 10 rounds EMOM"
				className="mb-8"
			/>
			<BarbellExerciseBlock
				label="Bench"
				storageKey="bench"
				tempo="3030"
				className="mb-8"
				steps={[0.8, 0.9, 1]}
			/>
			<BarbellExerciseBlock
				label="Deadlift"
				storageKey="deadlift"
				tempo="0030"
				steps={[0.9, 1]}
			/>
		</>
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

type BarbellExerciseProps = {
	label: string;
	tempo: string;
	storageKey: string;
	steps: number[];
	className?: string;
};

function BarbellExerciseBlock(props: BarbellExerciseProps) {
	const { label, tempo, storageKey, steps, className } = props;

	const [value, setValue] = useLocalStorageState(storageKey, 0);
	const weightsData = useMemo(() => createWeightsData(value, steps), [value]);

	return (
		<div className={`${className || ''} display-width`}>
			<h3 className="mb-2 text-2xl">{label}</h3>
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
			<Timer />
		</div>
	);
}

type KettlebellExerciseProps = {
	label: string;
	storageKey: string;
	scheme: string;
	className?: string;
};

// TODO update this list
const availableKettlebells = [16, 20, 24, 28, 32, 40];

function KettlebellExerciseBlock(props: KettlebellExerciseProps) {
	const { label, storageKey, scheme, className } = props;

	const [value, setValue] = useLocalStorageState(storageKey, 0);

	function progress() {
		setValue(d => {
			return availableKettlebells.find(val => val > d) ?? d;
		});
	}

	function deload() {
		setValue(d => {
			return (
				[...availableKettlebells].reverse().find(val => val < d) ?? d
			);
		});
	}

	return (
		<div className={`${className || ''} display-width`}>
			<h3 className="mb-2 text-2xl">{label}</h3>
			<p className="mb-4">{scheme}</p>

			<div className="flex flex-col items-start gap-4 mb-4 whitespace-pre">
				<div>
					<p>Weight:</p>
					<p>{value}kg</p>
				</div>

				<button className="button" onClick={progress}>
					Progress
				</button>
				<button className="button" onClick={deload}>
					Deload
				</button>
			</div>
		</div>
	);
}
function Timer({ showControls = true }: { showControls?: boolean }) {
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
