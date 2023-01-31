import { ReactElement } from 'react';
import sample from 'lodash/sample';
import { allWeights, allWods, allFinishers } from 'lib/workouts';
import { GetServerSideProps } from 'next';

export const config = {
	runtime: 'experimental-edge',
};

export default function Workout(): ReactElement {
	return <div />;
}

const weights = allWeights.map(({ id }) => id);
const wods = allWods.map(({ id }) => id);
const finishers = allFinishers.map(({ id }) => id);

function getId(
	array: string[],
	filter: StringTuple | undefined | null,
): string | undefined {
	const filteredArray = filter
		? array.filter(el =>
				Array.isArray(filter) ? !filter.includes(el) : el !== filter,
		  )
		: array;
	return sample(filteredArray);
}

type StringTuple = string | [string] | [string, string];

export type LastVisit = {
	lastWeights?: StringTuple;
	lastWod?: StringTuple | null;
	lastFinisher?: StringTuple | null;
};

export const cookieName = 'workout';

export const getServerSideProps: GetServerSideProps = async context => {
	const lastVisitJson = context.req.cookies[cookieName];
	const lastVisit: LastVisit = lastVisitJson ? JSON.parse(lastVisitJson) : {};

	const weightsId = getId(weights, lastVisit.lastWeights);
	const wodId = getId(wods, lastVisit.lastWod);
	const finisherId = getId(finishers, lastVisit.lastFinisher);

	return {
		redirect: {
			destination: `${process.env.NEXT_PUBLIC_URL_BASE}/workout/${weightsId}/${wodId}/${finisherId}`,
			permanent: false,
		},
	};
};
