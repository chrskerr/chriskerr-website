import { useEffect, useState } from 'react';

import padStart from 'lodash/padStart';

function createTimeString(secondsElapsed: number): string {
	if (!secondsElapsed) return '0:00';

	const seconds = secondsElapsed % 60;
	const minutes = Math.floor(secondsElapsed / 60);

	return `${minutes}:${padStart(String(seconds), 2, '0')}`;
}

type TimerData = {
	timeString: string;
	isRunning: boolean;
	start: () => void;
	startStop: () => void;
	restart: () => void;
};

function useTimer(): TimerData {
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

type TimerProps = {
	showControls?: boolean;
};

export function Timer({ showControls = false }: TimerProps) {
	const { timeString, isRunning, start, restart, startStop } = useTimer();

	useEffect(() => {
		if (!showControls && !isRunning) start();
	}, [showControls]);

	return (
		<div className="flex items-center">
			<time className="mr-4 text-3xl">{timeString}</time>
			{showControls && (
				<>
					<button className="mr-4 button" onClick={startStop}>
						{isRunning ? 'Stop' : 'Start'}
					</button>
					<button
						className="button"
						onClick={restart}
						disabled={!isRunning}
					>
						Restart
					</button>
				</>
			)}
		</div>
	);
}
