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
} from 'components/pttp';
import { useDeterministicSample } from 'components/pttp/hooks';

const title = 'Training tracker';

const options: [() => ReactElement, ...(() => ReactElement)[]] = [
	Deadlift,
	TurkishGetUp,
	Bench,
	Curls,
	AssaultBike,
];

export default function Pttp(): ReactElement {
	const exercises = useDeterministicSample(options, 4, 'pttp');

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
				<Exercise key={i} />
			))}
		</>
	);
}
