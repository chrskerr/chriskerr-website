import { ReactElement } from 'react';

import { NextSeo } from 'next-seo';

import {
	Bench,
	DbCurls,
	CableCurls,
	Deadlift,
	TurkishGetUp,
	Warmup,
	Rowing,
	DbBench,
	StairStepper,
	SingleLegCalfRaises,
	LungeWalking,
} from 'components/pttp/prefabs/chris';
import { Timer } from 'components/pttp/timing';
import { useDeterministicSample } from 'components/pttp/hooks/randomness';
import { DeepReadonly, NotEmpty, WithWeight } from 'components/pttp/types';
import { DisableClickConstraintContextProvider } from 'components/pttp/context/disableClickConstraint';

const title = 'Training tracker';

const options: DeepReadonly<NotEmpty<WithWeight<() => ReactElement>>> = [
	{ weight: 20, component: Deadlift },
	{ weight: 10, component: TurkishGetUp },
	{ weight: 15, component: Bench },
	{ weight: 10, component: DbCurls },
	{ weight: 10, component: CableCurls },
	{ weight: 15, component: Rowing },
	{ weight: 15, component: DbBench },
	{ weight: 15, component: StairStepper },
	{ weight: 10, component: SingleLegCalfRaises },
	{ weight: 10, component: LungeWalking },
];

export default function Training(): ReactElement {
	const exercises = useDeterministicSample(options, 35, 'pttp');

	return (
		<>
			<NextSeo
				title={title}
				description={title}
				canonical="https://www.chriskerr.dev/training"
				noindex
			/>
			<div className="-mb-8 display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<Timer />
			</div>
			{[0, 2, 4, 6].includes(new Date().getDay()) && (
				<div className="display-width divider-before">
					<p>Today is a running day, do that if possible.</p>
				</div>
			)}
			<DisableClickConstraintContextProvider>
				<Warmup />
				{exercises.map((index, i) => {
					const Component = options[index].component;
					return Component ? <Component key={i} /> : false;
				})}
			</DisableClickConstraintContextProvider>
		</>
	);
}
