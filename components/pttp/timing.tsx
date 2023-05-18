import { useEffect } from 'react';

import { useInterval, useTimer } from './hooks';

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

export function Interval({
	showLeftRight = true,
}: {
	showLeftRight?: boolean;
}) {
	const { timeString, isRunning, intervalsRemaining, startStop } =
		useInterval();

	return (
		<div>
			{showLeftRight && (
				<p>Next: {intervalsRemaining % 2 === 0 ? 'Left' : 'Right'}</p>
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
