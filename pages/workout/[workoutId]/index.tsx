import { allWorkouts } from 'lib/workouts';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ReactElement } from 'react';

type Props = {
	html: string;
};

export default function Workout({ html }: Props): ReactElement {
	return (
		<div
			className="prose display-width"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

const redirectObj = {
	redirect: {
		destination: '/workout',
		permanent: false,
	},
};

export const getStaticProps: GetStaticProps<Props> = async context => {
	if (!context.params?.workoutId || Array.isArray(context.params.workoutId)) {
		return redirectObj;
	}

	const workoutId = Number(context.params.workoutId);
	if (!workoutId) {
		return redirectObj;
	}

	const workout = allWorkouts.find(({ id }) => id === workoutId);
	if (!workout) {
		return redirectObj;
	}

	return {
		props: {
			html: workout.html,
		},
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const ids = allWorkouts.map(({ id }) => id);

	return {
		paths: ids.map(id => ({ params: { workoutId: id.toString() } })),
		fallback: false,
	};
};
