import { ReactElement } from 'react';
import sample from 'lodash/sample';
import { allWeights, allWods } from 'lib/workouts';
import { GetServerSideProps } from 'next';

export default function Workout(): ReactElement {
	return <div />;
}

const weights = allWeights.map(({ id }) => id.toString());
const wods = allWods.map(({ id }) => id.toString());

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
			destination: `/workout/${weightsId}/${wodId}`,
			permanent: false,
		},
	};
};
