import { ReactElement } from 'react';

import { NextSeo } from 'next-seo';

import {
	GluteHamRaiseRehab,
	GoodmorningRehab,
	RdlRehab,
	Timer,
} from 'components/pttp';

const title = 'Strong 🥒';

export default function Pttp(): ReactElement {
	return (
		<>
			<NextSeo
				title={title}
				description={title}
				canonical="https://www.chriskerr.dev/strong-pickle"
				noindex
			/>
			<div className="-mb-8 display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<Timer />
			</div>
			<div className="display-width divider-before" />

			<RdlRehab />
			<GoodmorningRehab />
			<GluteHamRaiseRehab />
		</>
	);
}
