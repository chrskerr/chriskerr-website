import { allFinishers, allWeights, allWods } from 'lib/workouts';
import { padStart } from 'lodash';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { LastVisit } from 'pages/workout';
import { ReactElement, useEffect, useState } from 'react';

type Props = {
	weightsId: string;
	weightsHtml: string;

	wodId: string | null;
	wodHtml: string | null;

	finisherId: string | null;
	finisherHtml: string | null;
};

export default function Workout({
	weightsId,
	weightsHtml,
	wodId,
	wodHtml,
	finisherId,
	finisherHtml,
}: Props): ReactElement {
	const [workoutStartedAt] = useState(new Date());

	useEffect(() => {
		const body: LastVisit = {
			lastWeights: weightsId,
			lastWod: wodId,
			lastFinisher: finisherId,
		};
		fetch('/api/set-last-visited', {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body),
		}).catch(e => console.log(e));
	}, [weightsId, wodId]);

	return (
		<div className="prose display-width">
			<Timer timeFrom={workoutStartedAt} />
			<hr />
			<h4>Part A:</h4>
			<div dangerouslySetInnerHTML={{ __html: weightsHtml }} />
			<Counter />
			<hr />
			{wodHtml && (
				<>
					<h4>Part B:</h4>
					<div dangerouslySetInnerHTML={{ __html: wodHtml }} />
					<Counter />
					<hr />
				</>
			)}
			{finisherHtml && (
				<>
					<h4>Finisher (optional):</h4>
					<div dangerouslySetInnerHTML={{ __html: finisherHtml }} />
					<Counter />
					<hr />
				</>
			)}
			<hr />
			<Link href="/workout">Get another?</Link>
		</div>
	);
}

const redirectObj = {
	redirect: {
		destination: '/workout',
		permanent: false,
	},
};

export const getStaticProps: GetStaticProps<Props> = async context => {
	const ids = context.params?.ids;

	if (!ids || !Array.isArray(ids)) {
		return redirectObj;
	}

	const [weightsId, wodId, finisherId] = ids;
	if (!weightsId) {
		return redirectObj;
	}

	const weights = allWeights.find(({ id }) => id === weightsId);
	if (!weights) {
		return redirectObj;
	}

	const wod = allWods.find(({ id }) => id === wodId);
	const finisher = allFinishers.find(({ id }) => id === finisherId);

	return {
		props: {
			weightsId: weights.id,
			weightsHtml: weights.html,

			wodId: wod?.id ?? null,
			wodHtml: wod?.html ?? null,

			finisherId: finisher?.id ?? null,
			finisherHtml: finisher?.html ?? null,
		},
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const weights = allWeights.map(({ id }) => id);
	const wods = allWods.map(({ id }) => id);
	const finishers = allFinishers.map(({ id }) => id);

	const paths: Array<{
		params: { ids: [string] | [string, string] | [string, string, string] };
	}> = [];

	for (const weightsId of weights) {
		paths.push({ params: { ids: [weightsId] } });
		for (const wodId of wods) {
			paths.push({ params: { ids: [weightsId, wodId] } });
			for (const finisherId of finishers) {
				paths.push({ params: { ids: [weightsId, wodId, finisherId] } });
			}
		}
	}

	return {
		paths,
		fallback: false,
	};
};

function Timer({ timeFrom }: { timeFrom: Date | undefined }) {
	const [currTime, setCurrTime] = useState(Date.now());

	useEffect(() => {
		const ref = window.setInterval(() => {
			setCurrTime(Date.now());
		}, 200);

		return () => {
			window.clearInterval(ref);
		};
	}, []);

	const differenceInSeconds = Math.max(
		timeFrom
			? Math.floor(currTime / 1_000) -
					Math.floor(timeFrom.valueOf() / 1_000)
			: 0,
		0,
	);

	const seconds = padStart(String(differenceInSeconds % 60), 2, '0');
	const minutes = Math.floor(differenceInSeconds / 60);

	const timeString = timeFrom ? `${minutes}:${seconds}` : 'Not started';

	return <div>{timeString || '0 seconds'}</div>;
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
			<div className="flex items-center mb-2 sm:mr-8">
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
			<Timer timeFrom={lastSetAt} />
		</div>
	);
}
