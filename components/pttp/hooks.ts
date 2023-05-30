import {
	Dispatch,
	ReactElement,
	SetStateAction,
	useEffect,
	useState,
} from 'react';
import { createTimeString } from './helpers/createTimeString';
import { NotEmpty, WithWeight } from './types';

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

function getOne<T>(array: Readonly<NotEmpty<T>>, salt: string): T {
	return array[getSeed(salt) % array.length];
}

function getMany<T extends { weight: number }>(
	array: Readonly<NotEmpty<Readonly<T>>>,
	maxWeight: Readonly<number>,
	salt: Readonly<string>,
): T[] {
	let tmpArray = [...array];
	const result: T[] = [];

	let allocatedWeight = 0;

	while (allocatedWeight < maxWeight) {
		const remainingWeight = maxWeight - allocatedWeight;
		if (remainingWeight <= 0) break;

		tmpArray = tmpArray.filter(curr => curr.weight <= remainingWeight);
		if (!tmpArray.length) break;

		const chosenExercise = tmpArray.splice(
			getSeed(salt) % tmpArray.length,
			1,
		)[0];
		if (!chosenExercise) break;

		result.push(chosenExercise);
		allocatedWeight += chosenExercise.weight;
	}

	return result;
}

export function useDeterministicRange<T>(
	array: Readonly<NotEmpty<Readonly<T>>>,
	salt: Readonly<string>,
): T {
	const [el, setEl] = useState<T>(getOne(array, salt));

	useEffect(() => {
		setEl(getOne(array, salt));
	}, [array, salt]);

	return el;
}

export function useDeterministicSample<T extends () => ReactElement>(
	array: Readonly<NotEmpty<Readonly<WithWeight<T>>>>,
	maxWeight: Readonly<number>,
	salt: Readonly<string>,
): WithWeight<T>[] {
	const [els, setEls] = useState<WithWeight<T>[]>(
		getMany(array, maxWeight, salt),
	);

	useEffect(() => {
		setEls(getMany(array, maxWeight, salt));
	}, [salt, maxWeight, array]);

	return els;
}
