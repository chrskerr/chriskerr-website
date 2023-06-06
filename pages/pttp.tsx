import { ReactElement } from 'react';

import { NextSeo } from 'next-seo';

import {
	Bench,
	DbCurls,
	CableCurls,
	Deadlift,
	TurkishGetUp,
	Warmup,
	AssaultBike,
	Rowing,
	DbBench,
} from 'components/pttp/prefabs/chris';
import { Timer } from 'components/pttp/timing';
import { useDeterministicSample } from 'components/pttp/hooks/randomness';
import { DeepReadonly, NotEmpty, WithWeight } from 'components/pttp/types';
import { DisableClickConstraintContextProvider } from 'components/pttp/hooks/context';

const title = 'Training tracker';

const options: DeepReadonly<NotEmpty<WithWeight<() => ReactElement>>> = [
	{ weight: 20, component: Deadlift },
	{ weight: 10, component: TurkishGetUp },
	{ weight: 15, component: Bench },
	{ weight: 5, component: DbCurls },
	{ weight: 5, component: CableCurls },
	{ weight: 20, component: AssaultBike },
	{ weight: 15, component: Rowing },
	{ weight: 15, component: DbBench },
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

			<DisableClickConstraintContextProvider>
				{exercises.map(index => {
					const Component = options[index].component;
					if (!Component) return false;
					return <Component key={index} />;
				})}
			</DisableClickConstraintContextProvider>
		</>
	);
}
