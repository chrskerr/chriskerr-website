import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { createTimeString } from './helpers/createTimeString';

export function useLocalStorageState(
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
	totalIntervals = 10,
	intervalDuration = 60,
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

async function getCodePointSum(salt?: string): Promise<number> {
	const hashBuffer = await crypto.subtle?.digest(
		'SHA-256',
		Buffer.from(`${new Date().toDateString()}-${salt ?? ''}`),
	);

	if (!hashBuffer) return 0;

	let codePointSum = 0;
	if (hashBuffer) {
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');

		for (const char of hashHex) {
			codePointSum += char.codePointAt(0) ?? 0;
		}
	}

	return codePointSum;
}

export function useDeterministicRange<T>(array: [T, ...T[]], salt?: string): T {
	const [el, setEl] = useState<T>(array[0]);

	useEffect(() => {
		(async () => {
			const codePointSum = await getCodePointSum(salt);
			setEl(array[codePointSum % array.length]);
		})();
	}, [salt, array]);

	return el;
}
