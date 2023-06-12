import { ReactElement, useEffect, useState } from 'react';

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
	{ weight: 15, component: Rowing },
	{ weight: 15, component: DbBench },
];

const weightsDays = [1, 3, 5];

export default function Training(): ReactElement {
	const [dayOfWeek, set] = useState(new Date().getDay());
	const exercises = useDeterministicSample(options, 35, 'pttp');

	useEffect(() => {
		const onFocus = () => {
			set(new Date().getDay());
		};
		window.addEventListener('focus', onFocus);

		return () => {
			window.removeEventListener('focus', onFocus);
		};
	}, []);

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
			{weightsDays.includes(dayOfWeek) ? (
				<DisableClickConstraintContextProvider>
					<Warmup />
					{exercises.map((index, i) => {
						const Component = options[index].component;
						return Component ? <Component key={i} /> : false;
					})}
				</DisableClickConstraintContextProvider>
			) : (
				<div className="display-width divider-before">
					<p>Run day</p>
				</div>
			)}
		</>
	);
}
