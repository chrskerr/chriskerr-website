import { ReactElement } from 'react';
import sample from 'lodash/sample';
import { allWorkouts } from 'lib/workouts';
import { GetServerSideProps } from 'next';

export default function Workout(): ReactElement {
	return <div />;
}

const ids = allWorkouts.map(({ id }) => id);

export const getServerSideProps: GetServerSideProps = async () => {
	return {
		redirect: {
			destination: `/workout/${sample(ids)}`,
			permanent: false,
		},
	};
};
