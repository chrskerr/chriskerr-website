import { ReactElement, useEffect, useState } from 'react';

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
} from 'components/pttp/prefabs/kate';
import { Timer } from 'components/pttp/timing';

import { DeepReadonly, NotEmpty, WithWeight } from 'components/pttp/types';
import { useDeterministicSample } from 'components/pttp/hooks/randomness';
import { DisableClickConstraintContextProvider } from 'components/pttp/context/disableClickConstraint';

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

export default function StrongPickleWrapper(): ReactElement {
	const [render, setRender] = useState(false);

	useEffect(() => {
		setRender(true);
	}, []);

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
			<DisableClickConstraintContextProvider>
				{render && <StrongPickle />}
			</DisableClickConstraintContextProvider>
		</>
	);
}
function StrongPickle(): ReactElement {
	const rehabs = useDeterministicSample(rehabOptions, 10, 'rehab');
	const mains = useDeterministicSample(mainOptions, 45, 'mains');

	return (
		<>
			{[...rehabs, ...mains].map((Component, i) => {
				return Component ? <Component key={i} /> : false;
			})}
		</>
	);
}
