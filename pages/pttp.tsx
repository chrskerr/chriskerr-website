import { ReactElement } from 'react';

import { NextSeo } from 'next-seo';

import {
	Bench,
	Curls,
	Deadlift,
	Timer,
	TurkishGetUp,
	Warmup,
	AssaultBike,
	Rowing,
} from 'components/pttp';
import { useDeterministicSample } from 'components/pttp/hooks';
import { NotEmpty, WithWeight } from 'components/pttp/types';

const title = 'Training tracker';

const options: NotEmpty<WithWeight<() => ReactElement>> = [
	{ key: 'deadlift', weight: 20, component: Deadlift },
	{ key: 'tgu', weight: 10, component: TurkishGetUp },
	{ key: 'bench', weight: 15, component: Bench },
	{ key: 'curls', weight: 10, component: Curls },
	{ key: 'assault-bike', weight: 20, component: AssaultBike },
	{ key: 'rowing', weight: 10, component: Rowing },
];

export default function Pttp(): ReactElement {
	const exercises = useDeterministicSample(options, 55, 'pttp');

	return (
		<>
			<NextSeo
				title={title}
				description={title}
				canonical="https://www.chriskerr.dev/pttp"
				noindex
			/>
			<div className="-mb-8 display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<Timer />
			</div>
			<div className="display-width divider-before" />

			<Warmup />

			{exercises.map((Exercise, i) => (
				<Exercise.component key={i} />
			))}
		</>
	);
}
