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

export function getId(
	array: string[],
	filter: string | string[] | undefined | null,
): string | undefined {
	if (!filter) return sample(array);

	const weights: Record<string, number> = {};
	const defaultWeight = Array.isArray(filter) ? filter.length : 2;
	for (const el of array) {
		weights[el] = defaultWeight;
	}

	if (Array.isArray(filter)) {
		for (let i = 0; i < filter.length; i++) {
			const filterItem = filter[i];
			weights[filterItem] =
				(weights[filterItem] ?? defaultWeight) - (filter.length - i);
		}
	}

	const filledArray: string[] = [];
	for (const entry of Object.entries(weights)) {
		if (entry[1] > 0) {
			for (let i = 0; i < entry[1]; i++) {
				filledArray.push(entry[0]);
			}
		}
	}

	return sample(filledArray);
}

export type LastVisit = {
	lastWeights?: string | string[];
	lastWod?: string | string[] | null;
	lastFinisher?: string | string[] | null;
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
