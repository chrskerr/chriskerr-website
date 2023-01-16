import { ReactElement } from 'react';
import sample from 'lodash/sample';
import { allWeights, allWods } from 'lib/workouts';
import { GetServerSideProps } from 'next';

export const config = {
	runtime: 'experimental-edge',
};

export default function Workout(): ReactElement {
	return <div />;
}

const weights = allWeights.map(({ id }) => id);
const wods = allWods.map(({ id }) => id);

export type LastVisit = {
	lastWeights?: string;
	lastWod?: string;
};

export const cookieName = 'workout';

export const getServerSideProps: GetServerSideProps = async context => {
	const lastVisitJson = context.req.cookies[cookieName];
	const lastVisit: LastVisit = lastVisitJson ? JSON.parse(lastVisitJson) : {};

	const weightsId = sample(
		weights.filter(id => id !== lastVisit.lastWeights),
	);
	const wodId = sample(wods.filter(id => id !== lastVisit.lastWod));

	return {
		redirect: {
			destination: `${process.env.NEXT_PUBLIC_URL_BASE}/workout/${weightsId}/${wodId}`,
			permanent: false,
		},
	};
};
