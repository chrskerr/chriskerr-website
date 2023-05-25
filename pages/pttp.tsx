import { ReactElement } from 'react';

import { NextSeo } from 'next-seo';

import {
	Bench,
	Curls,
	Deadlift,
	Swings,
	Timer,
	TurkishGetUp,
	Warmup,
} from 'components/pttp';
import { useDeterministicSample } from 'components/pttp/hooks';

const title = 'Training tracker';

const options: [typeof Swings, ...(typeof Swings)[]] = [
	Deadlift,
	TurkishGetUp,
	Swings,
	Bench,
	Curls,
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

			{!!exercises &&
				exercises.map((Exercise, i) => <Exercise key={i} />)}
		</>
	);
}
