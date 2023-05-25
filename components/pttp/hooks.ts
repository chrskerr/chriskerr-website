import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { createTimeString } from './helpers/createTimeString';
import { seedFunc, oneOf, sequence } from 'aimless.js';

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

function getCodePointSum(str: string): number {
	return str
		.split('')
		.reduce<number>((acc, curr) => acc + (curr.codePointAt(0) ?? 0), 0);
}

function getSeedFunc(salt: string): () => number {
	const seedString = new Date().toISOString().split('T')[0] + '-' + salt;
	return seedFunc(getCodePointSum(seedString));
}

function getOne<T>(array: [T, ...T[]], salt: string): T {
	return oneOf(array, getSeedFunc(salt));
}

function getMany<T>(array: [T, ...T[]], count: number, salt: string): T[] {
	return sequence(array, getSeedFunc(salt)).splice(0, count);
}

export function useDeterministicRange<T>(array: [T, ...T[]], salt: string): T {
	const [el, setEl] = useState<T>(getOne(array, salt));

	useEffect(() => {
		setEl(getOne(array, salt));
	}, [array, salt]);

	return el;
}

export function useDeterministicSample<T>(
	array: [T, ...T[]],
	count: number,
	salt: string,
): T[] {
	const [els, setEls] = useState<T[]>(getMany(array, count, salt));

	useEffect(() => {
		setEls(getMany(array, count, salt));
	}, [salt, count, array]);

	return els;
}
