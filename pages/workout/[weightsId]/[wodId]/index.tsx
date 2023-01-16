import { allWeights, allWods } from 'lib/workouts';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { LastVisit } from 'pages/workout';
import { ReactElement, useEffect } from 'react';

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
			<h4>Part A:</h4>
			<div
				className="mb-12"
				dangerouslySetInnerHTML={{ __html: weightsHtml }}
			/>
			<hr />
			<h4>Part B:</h4>
			<div
				className="mb-12"
				dangerouslySetInnerHTML={{ __html: wodHtml }}
			/>
			<hr />
			<h4>Finisher (optional):</h4>
			<div className="mb-12">
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
