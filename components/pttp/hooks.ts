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

function getCodePointProduct(str: string): number {
	return str
		.split('')
		.reduce<number>((acc, curr) => acc * (curr.codePointAt(0) ?? 0), 1);
}

function getSeed(salt: string): number {
	return (
		Math.floor((Date.now() + 36_000_000) / 86_400_000) *
		getCodePointProduct(salt)
	);
}

function getOne<T>(array: NotEmpty<T>, salt: string): T {
	return array[getSeed(salt) % array.length];
}

function getMany<T extends { weight: number; key: string }>(
	array: NotEmpty<T>,
	maxWeight: number,
	salt: string,
): T[] {
	let tmpArray = [...array];
	const result: T[] = [];

	let allocatedWeight = 0;

	while (allocatedWeight < maxWeight) {
		const remainingWeight = maxWeight - allocatedWeight;
		if (remainingWeight <= 0) break;

		const possibleExercises = tmpArray.filter(
			curr => curr.weight <= remainingWeight,
		);
		if (!possibleExercises.length) break;

		const chosenExercise =
			possibleExercises[getSeed(salt) % tmpArray.length];
		if (!chosenExercise) break;

		result.push(chosenExercise);
		tmpArray = tmpArray.filter(curr => curr.key !== chosenExercise.key);
		allocatedWeight += chosenExercise.weight;
	}

	return result;
}

export function useDeterministicRange<T>(array: NotEmpty<T>, salt: string): T {
	const [el, setEl] = useState<T>(getOne(array, salt));

	useEffect(() => {
		setEl(getOne(array, salt));
	}, [array, salt]);

	return el;
}

export function useDeterministicSample<T extends () => ReactElement>(
	array: NotEmpty<WithWeight<T>>,
	maxWeight: number,
	salt: string,
): WithWeight<T>[] {
	const [els, setEls] = useState<WithWeight<T>[]>(
		getMany(array, maxWeight, salt),
	);

	useEffect(() => {
		setEls(getMany(array, maxWeight, salt));
	}, [salt, maxWeight, array]);

	return els;
}
