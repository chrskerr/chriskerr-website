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
		<>
			<div
				className="mb-12 prose display-width"
				dangerouslySetInnerHTML={{ __html: weightsHtml }}
			/>
			<div
				className="mb-12 prose display-width"
				dangerouslySetInnerHTML={{ __html: wodHtml }}
			/>
			<div className="prose display-width">
				<Link href="/workout">Get another?</Link>
			</div>
		</>
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

	const weightsId = Number(maybeWeightsId);
	const wodId = Number(maybeWodId);
	if (!weightsId || !wodId) {
		return redirectObj;
	}

	const weights = allWeights.find(({ id }) => id === weightsId);
	const wod = allWods.find(({ id }) => id === wodId);
	if (!weights || !wod) {
		return redirectObj;
	}

	return {
		props: {
			weightsId: weights.id.toString(),
			wodId: wod.id.toString(),

			weightsHtml: weights.html,
			wodHtml: wod.html,
		},
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const weights = allWeights.map(({ id }) => id.toString());
	const wods = allWods.map(({ id }) => id.toString());

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
