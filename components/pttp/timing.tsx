import { useEffect } from 'react';

import { useInterval, useTimer } from './hooks/timing';

type TimerProps = {
	showControls?: boolean;
	noBeep?: boolean;
};

export function Timer({ showControls = false, noBeep = false }: TimerProps) {
	const { timeString, isRunning, start, restart, startStop } = useTimer(
		noBeep ? undefined : 30,
	);

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

interface IntervalProps {
	leftRightLabels?: [string, string] | null;

	/**
	 * length of each interval in seconds
	 * @default 60
	 * */
	durationSeconds?: number;
	/**
	 * number of intervals to perform
	 * @default 10
	 * */
	count?: number;
}

export function Interval({
	leftRightLabels = ['left', 'right'],
	durationSeconds = 60,
	count = 10,
}: IntervalProps) {
	const { timeString, isRunning, intervalsRemaining, startStop } =
		useInterval(count, durationSeconds, [3, 2, 1]);

	return (
		<div>
			{!!leftRightLabels && (
				<p>
					Next:{' '}
					{intervalsRemaining > 0
						? leftRightLabels[intervalsRemaining % 2]
						: 'finish'}
				</p>
			)}
			<p>{intervalsRemaining} rounds remaining</p>
			<div className="flex items-center">
				<time className="mr-4 text-3xl">{timeString}</time>
				<button className="mr-4 button" onClick={startStop}>
					{isRunning ? 'Stop' : 'Start'}
				</button>
			</div>
		</div>
	);
}
