import { ReactElement } from 'react';
import sample from 'lodash/sample';
import { allWeights, allRunning } from 'lib/fit-pickle';
import { GetServerSideProps } from 'next';

export const config = {
	runtime: 'experimental-edge',
};

export default function Workout(): ReactElement {
	return <div />;
}

const weights = allWeights.map(({ id }) => id);
const running = allRunning.map(({ id }) => id);

function getId(
	array: string[],
	filter: string | undefined | null,
): string | undefined {
	return sample(array.filter(id => id !== filter));
}

export type LastPickleVisit = {
	lastWeights?: string;
	lastRunning?: string;
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
