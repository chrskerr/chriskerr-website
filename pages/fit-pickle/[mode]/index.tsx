import { ReactElement } from 'react';
import { allWeights, allRunning } from 'lib/fit-pickle';
import { GetServerSideProps } from 'next';
import { getId } from 'pages/workout';

export const config = {
	runtime: 'experimental-edge',
};

export default function Workout(): ReactElement {
	return <div />;
}

const weights = allWeights.map(({ id }) => id);
const running = allRunning.map(({ id }) => id);

export type LastPickleVisit = {
	lastWeights?: string | string[] | null;
	lastRunning?: string | string[] | null;
};

export const cookieName = 'fit-pickle';

export const getServerSideProps: GetServerSideProps = async context => {
	const mode = context.params?.mode;

	if (mode !== 'running' && mode !== 'gym') {
		return {
			notFound: true,
		};
	}

	const lastVisitJson = context.req.cookies[cookieName];
	const lastVisit: LastPickleVisit = lastVisitJson
		? JSON.parse(lastVisitJson)
		: {};

	const id =
		mode === 'running'
			? getId(running, lastVisit.lastRunning)
			: getId(weights, lastVisit.lastWeights);

	return {
		redirect: {
			destination: `${process.env.NEXT_PUBLIC_URL_BASE}/fit-pickle/${mode}/${id}`,
			permanent: false,
		},
	};
};
