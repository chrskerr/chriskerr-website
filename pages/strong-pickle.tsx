import { ReactElement } from 'react';

import { NextSeo } from 'next-seo';

import {
	Bench,
	DbCurls,
	GluteHamRaiseRehab,
	GoodmorningRehab,
	MachineCalfRaises,
	OverheadPress,
	PullUps,
	RdlRehab,
	SingleLegCalfRaises,
	Squats,
	Timer,
} from 'components/pttp';
import { DeepReadonly, NotEmpty, WithWeight } from 'components/pttp/types';
import { useDeterministicSample } from 'components/pttp/hooks';

const title = 'Strong 🥒';

type Exercises = DeepReadonly<NotEmpty<WithWeight<() => ReactElement>>>;

const rehabOptions: Exercises = [
	{ weight: 10, component: RdlRehab },
	{ weight: 10, component: GoodmorningRehab },
	{ weight: 10, component: GluteHamRaiseRehab },
];

const mainOptions: Exercises = [
	{ weight: 15, component: Bench },
	{ weight: 15, component: Squats },
	{ weight: 15, component: PullUps },
	{ weight: 15, component: OverheadPress },
	{ weight: 15, component: SingleLegCalfRaises },
	{ weight: 15, component: MachineCalfRaises },
	{ weight: 10, component: DbCurls },
];

export default function Pttp(): ReactElement {
	const rehabs = useDeterministicSample(rehabOptions, 10, 'rehab');
	const mains = useDeterministicSample(mainOptions, 45, 'mains');

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

			{rehabs.map(({ component: Exercise }, i) => (
				<Exercise key={i} />
			))}

			{mains.map(({ component: Exercise }, i) => (
				<Exercise key={i} />
			))}
		</>
	);
}
