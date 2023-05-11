import { ReactElement } from 'react';

import { NextSeo } from 'next-seo';

import {
	Bench,
	Deadlift,
	Swings,
	Timer,
	TurkishGetUp,
	Warmup,
} from 'components/pttp';

const title = 'PTTP tracker';

export default function Pttp(): ReactElement {
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
			<Deadlift />
			<TurkishGetUp />
			<Swings />
			<Bench />
		</>
	);
}
