import { allWeights, allRunning } from 'lib/fit-pickle';
import capitalize from 'lodash/capitalize';
import padStart from 'lodash/padStart';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { LastPickleVisit } from '..';

type Props = {
	workoutId: string;
	workoutHtml: string;
	mode: 'running' | 'gym';
};

export default function Workout({
	workoutId,
	workoutHtml,
	mode,
}: Props): ReactElement {
	const [workoutStartedAt] = useState(new Date());

	useEffect(() => {
		const body: LastPickleVisit =
			mode === 'running'
				? {
						lastRunning: workoutId,
				  }
				: { lastWeights: workoutId };
		fetch('/api/set-last-pickle-visited', {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body),
		}).catch(e => console.log(e));
	}, [workoutId, mode]);

	return (
		<div className="prose display-width">
			<Timer timeFrom={workoutStartedAt} shouldReadTime={undefined} />
			<hr />
			<h4>
				{capitalize(mode)} {workoutId}:
			</h4>
			<div dangerouslySetInnerHTML={{ __html: workoutHtml }} />
			<Counter />
			<hr />
			<Link href={`/fit-pickle/${mode}`}>Get another?</Link>
		</div>
	);
}

export const getStaticProps: GetStaticProps<Props> = async context => {
	const mode = context.params?.mode;

	if (mode !== 'running' && mode !== 'gym') {
		return {
			notFound: true,
		};
	}

	const paramsId = context.params?.id;

	if (!paramsId || Array.isArray(paramsId)) {
		return {
			notFound: true,
		};
	}

	const workout =
		mode === 'running'
			? allRunning.find(({ id }) => id === paramsId)
			: allWeights.find(({ id }) => id === paramsId);
	if (!workout) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			workoutId: workout.id,
			workoutHtml: workout.html,
			mode,
		},
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const weights = allWeights.map(({ id }) => id);
	const running = allRunning.map(({ id }) => id);

	const paths: Array<{
		params: { mode: 'running' | 'gym'; id: string };
	}> = [];

	for (const id of weights) {
		paths.push({ params: { mode: 'gym', id } });
	}

	for (const id of running) {
		paths.push({ params: { mode: 'running', id } });
	}

	return {
		paths,
		fallback: false,
	};
};

function Timer({
	timeFrom,
	shouldReadTime,
}: {
	timeFrom: Date | undefined;
	shouldReadTime: ((elapsedSeconds: number) => boolean) | undefined;
}) {
	const [currTime, setCurrTime] = useState(Date.now());
	const timerRef = useRef<number | undefined>();

	useEffect(() => {
		timerRef.current = window.setInterval(() => {
			setCurrTime(Date.now());
		}, 200);

		return () => {
			window.clearInterval(timerRef.current);
		};
	}, []);

	useEffect(() => {
		if (!timerRef.current) {
			timerRef.current = window.setInterval(() => {
				setCurrTime(Date.now());
			}, 200);
			setCurrTime(Date.now());
		}
	}, [timeFrom]);

	const differenceInSeconds = Math.max(
		timeFrom
			? Math.floor(currTime / 1_000) -
					Math.floor(timeFrom.valueOf() / 1_000)
			: 0,
		0,
	);

	const seconds = differenceInSeconds % 60;
	const minutes = Math.floor(differenceInSeconds / 60);

	const timeString = timeFrom
		? `${minutes}:${padStart(String(seconds), 2, '0')}`
		: 'Not started';

	if (
		timeFrom &&
		typeof window !== 'undefined' &&
		!window.speechSynthesis.speaking &&
		shouldReadTime?.(differenceInSeconds)
	) {
		const minutesString = minutes
			? `${minutes} ${minutes > 1 ? 'minutes ' : 'minute '} `
			: '';

		const andString = minutes && seconds ? 'and ' : '';

		const secondsString = seconds
			? `${seconds} ${seconds > 1 ? 'seconds ' : 'second '} `
			: '';

		const toReadString =
			minutesString + andString + secondsString + 'elapsed';

		window.speechSynthesis.speak(
			new SpeechSynthesisUtterance(toReadString),
		);
	}

	function stopTimer() {
		window.clearInterval(timerRef.current);
		timerRef.current = undefined;
		setCurrTime(Date.now());
	}

	return (
		<div className="flex items-center">
			<p>{timeString || '0 seconds'}</p>
			{timerRef.current && (
				<button
					className="ml-4 w-[28px] text-white rounded aspect-square bg-brand hover:bg-brand-dark"
					onClick={stopTimer}
				>
					x
				</button>
			)}
		</div>
	);
}

function Counter() {
	const [lastSetAt, setLastSetAt] = useState<Date | undefined>();
	const [count, setCount] = useState(0);

	function decrement() {
		setCount(c => Math.max(c - 1, 0));
		setLastSetAt(new Date());
	}

	function increment() {
		setCount(c => c + 1);
		setLastSetAt(new Date());
	}

	return (
		<div className="flex flex-col items-center pt-6 sm:flex-row">
			<div className="flex items-center mb-2 sm:mb-0 sm:mr-8">
				<button
					className="w-[28px] text-white rounded aspect-square bg-brand hover:bg-brand-dark"
					onClick={decrement}
				>
					-
				</button>
				<p className="mx-6 my-0">Count: {count}</p>
				<button
					className="w-[28px] text-white rounded aspect-square bg-brand hover:bg-brand-dark"
					onClick={increment}
				>
					+
				</button>
			</div>
			<Timer
				timeFrom={lastSetAt}
				shouldReadTime={elapsedSeconds =>
					elapsedSeconds > 0 && elapsedSeconds % 30 === 0
				}
			/>
		</div>
	);
}
