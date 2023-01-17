import { allWeights, allWods } from 'lib/workouts';
import { padStart } from 'lodash';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { LastVisit } from 'pages/workout';
import { ReactElement, useEffect, useState } from 'react';

type Props = {
	weightsId: string;
	wodId: string;

	weightsHtml: string;
	wodHtml: string;
};

export default function Workout({
	weightsId,
	wodId,
	weightsHtml,
	wodHtml,
}: Props): ReactElement {
	const [workoutStartedAt] = useState(new Date());

	useEffect(() => {
		const body: LastVisit = {
			lastWeights: weightsId,
			lastWod: wodId,
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
			<h4>Part B:</h4>
			<div dangerouslySetInnerHTML={{ __html: wodHtml }} />
			<Counter />
			<hr />
			<h4>Finisher (optional):</h4>
			<div>
				<p>5+ minutes of working on things from the following:</p>
				<ul>
					<li>Handstands practise</li>
					<li>Pistol squat practise</li>
					<li>L-sit leg raise/hold, v-ups</li>
					<li>Some sort of curl</li>
					<li>Incline bench, flys</li>
					<li>Something else</li>
				</ul>
			</div>
			<Counter />
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
	const maybeWeightsId = context.params?.weightsId;
	const maybeWodId = context.params?.wodId;

	if (!maybeWeightsId || !maybeWodId) {
		return redirectObj;
	}

	if (Array.isArray(maybeWeightsId) || Array.isArray(maybeWodId)) {
		return redirectObj;
	}

	const weights = allWeights.find(({ id }) => id === maybeWeightsId);
	const wod = allWods.find(({ id }) => id === maybeWodId);
	if (!weights || !wod) {
		return redirectObj;
	}

	return {
		props: {
			weightsId: weights.id,
			wodId: wod.id,

			weightsHtml: weights.html,
			wodHtml: wod.html,
		},
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const weights = allWeights.map(({ id }) => id);
	const wods = allWods.map(({ id }) => id);

	const paths: Array<{ params: { weightsId: string; wodId: string } }> = [];

	for (const weightsId of weights) {
		for (const wodId of wods) {
			paths.push({ params: { weightsId, wodId } });
		}
	}

	return {
		paths,
		fallback: false,
	};
};

function Timer({ timeFrom }: { timeFrom: Date | undefined }) {
	const [currTime, setCurrTime] = useState(new Date());

	useEffect(() => {
		const ref = window.setInterval(() => {
			setCurrTime(new Date());
		}, 500);

		return () => {
			window.clearInterval(ref);
		};
	}, []);

	const differenceInSeconds = timeFrom
		? Math.floor(currTime.valueOf() / 1_000) -
		  Math.floor(timeFrom.valueOf() / 1_000)
		: 0;

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
		<div className="flex items-center pt-6">
			<button
				className="w-[28px] text-white rounded aspect-square bg-brand hover:bg-brand-dark"
				onClick={decrement}
			>
				-
			</button>
			<p className="mx-3 my-0">Count: {count}</p>
			<button
				className="w-[28px] text-white mr-8 rounded aspect-square bg-brand hover:bg-brand-dark"
				onClick={increment}
			>
				+
			</button>
			<Timer timeFrom={lastSetAt} />
		</div>
	);
}
