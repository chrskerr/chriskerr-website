import { useState } from 'react';
import { createTimeString } from '../helpers/createTimeString';

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
