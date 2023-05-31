import {
	Dispatch,
	ReactElement,
	SetStateAction,
	useEffect,
	useState,
} from 'react';
import { createTimeString } from './helpers/createTimeString';
import { DeepReadonly, NotEmpty, WithWeight } from './types';

export function useLocalStorageState(
	storageKey: string,
	fallbackValue: number,
): [number, Dispatch<SetStateAction<number>>] {
	const [value, setValue] = useState(fallbackValue);

	useEffect(() => {
		const newValue = localStorage.getItem(storageKey);
		if (newValue && !isNaN(Number(newValue))) {
			setValue(Number(newValue));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(storageKey, String(value));
	}, [value]);

	return [value, setValue];
}

type TimerData = {
	timeString: string;
	isRunning: boolean;
	start: () => void;
	startStop: () => void;
	restart: () => void;
};

export function useTimer(): TimerData {
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

	return {
		timeString: createTimeString(timeElapsed),
		isRunning: !!intervalData,
		restart,
		startStop,
		start,
	};
}

type IntervalData = {
	timeString: string;
	isRunning: boolean;
	intervalsRemaining: number;
	startStop: () => void;
};

export function useInterval(
	totalIntervals: number,
	intervalDuration: number,
): IntervalData {
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [intervalData, setIntervalData] = useState<number | undefined>(
		undefined,
	);

	const maxDuration = totalIntervals * intervalDuration;

	const timeElapsedInInterval = (timeElapsed - 1) % intervalDuration;
	const timeRemainingInInterval =
		timeElapsed > 1
			? timeElapsedInInterval === 0
				? 0
				: intervalDuration - timeElapsedInInterval
			: intervalDuration;
	const intervalsRemaining =
		totalIntervals - Math.ceil((timeElapsed - 1) / intervalDuration);

	function start() {
		const startedAt = Date.now() - 1500;
		const timerCallback = () => {
			const timeElapsed = Math.floor((Date.now() - startedAt) / 1000);
			if (timeElapsed >= maxDuration) stop();
			else setTimeElapsed(timeElapsed);
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

	return {
		timeString: createTimeString(timeRemainingInInterval),
		isRunning: !!intervalData,
		startStop,
		intervalsRemaining,
	};
}

function getCodePointProduct(str: Readonly<string>): number {
	return str
		.split('')
		.reduce<number>((acc, curr) => acc * (curr.codePointAt(0) ?? 0), 1);
}

function getSeed(salt: Readonly<string>): number {
	return (
		Math.floor((Date.now() + 36_000_000) / 86_400_000) *
		getCodePointProduct(salt)
	);
}

/**
 * Park-Miller PRNG
 * @returns {number} 0 to 1 (not inclusive)
 */
function getSeedFunc(salt: Readonly<string>): () => number {
	const seed = getSeed(salt);
	let currentSeed = seed % 2147483647;

	return () => {
		currentSeed = (currentSeed * 16807) % 2147483647;
		return (currentSeed - 1) / 2147483646;
	};
}

function getOne<T>(
	array: DeepReadonly<NotEmpty<T>>,
	salt: string,
): DeepReadonly<T> {
	return array[getSeed(salt) % array.length];
}

function getMany<T extends { weight: number }>(
	array: DeepReadonly<NotEmpty<T>>,
	maxWeight: Readonly<number>,
	salt: Readonly<string>,
): DeepReadonly<T>[] {
	let tmpArray = [...array];
	const result: DeepReadonly<T>[] = [];

	let allocatedWeight = 0;

	const seedFunc = getSeedFunc(salt);

	while (allocatedWeight < maxWeight) {
		const remainingWeight = maxWeight - allocatedWeight;
		if (remainingWeight <= 0) break;

		tmpArray = tmpArray.filter(curr => curr.weight <= remainingWeight);
		if (!tmpArray.length) break;

		const index = Math.floor(seedFunc() * tmpArray.length);
		const chosenExercise = tmpArray.splice(index, 1)[0];
		if (!chosenExercise) break;

		result.push(chosenExercise);
		allocatedWeight += chosenExercise.weight;
	}

	return result;
}

export function useDeterministicRange<T>(
	array: DeepReadonly<NotEmpty<T>>,
	salt: Readonly<string>,
): DeepReadonly<T> {
	const [el, setEl] = useState<DeepReadonly<T>>(getOne(array, salt));

	useEffect(() => {
		setEl(getOne(array, salt));
	}, [array, salt]);

	return el;
}

export function useDeterministicSample<T extends () => ReactElement>(
	array: DeepReadonly<NotEmpty<WithWeight<T>>>,
	maxWeight: Readonly<number>,
	salt: Readonly<string>,
): DeepReadonly<Array<WithWeight<T>>> {
	const [els, setEls] = useState<DeepReadonly<Array<WithWeight<T>>>>(
		getMany(array, maxWeight, salt),
	);

	useEffect(() => {
		setEls(getMany(array, maxWeight, salt));
	}, [salt, maxWeight, array]);

	return els;
}
