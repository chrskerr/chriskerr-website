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
	CalfRaiseMachine,
	LungeWalking,
	PlateSitup,
	PullUps,
	Swings,
	OneHandedSwings,
	Squats,
} from 'components/pttp/prefabs/chris';
import { useDeterministicPick } from 'components/pttp/hooks/randomness';
import { DeepReadonly, NotEmpty } from 'components/pttp/types';
import { DisableClickConstraintContextProvider } from 'components/pttp/context/disableClickConstraint';

const title = 'Training tracker';

type Exercises = DeepReadonly<NotEmpty<() => ReactElement>>;

const hinge: Exercises = [Deadlift, Swings, OneHandedSwings, Squats];
const upper: Exercises = [Bench, Bench, TurkishGetUp];
const vanity: Exercises = [DbCurls, CableCurls, PullUps];
const prehab: Exercises = [
	Rowing,
	CalfRaiseMachine,
	CalfRaiseMachine,
	LungeWalking,
	PlateSitup,
];

export default function TrainingWrapper(): ReactElement {
	const [render, setRender] = useState(false);

	useEffect(() => {
		setRender(true);
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
			</div>
			{/* {[0, 2, 4, 6].includes(new Date().getDay()) && ( */}
			<div className="display-width divider-before">
				<p>
					Today is an aerobic day, do at least 30 mins z1 / z2. Ideas:
				</p>
				<ul className="mt-4 ml-6 list-disc">
					<li>Go for a run</li>
					<li>Cycle</li>
					<li>High incline treadmill walking</li>
					<li>Stair stepper</li>
				</ul>
			</div>
			{/* )} */}
			<DisableClickConstraintContextProvider>
				<Warmup />
				{render && <Training />}
			</DisableClickConstraintContextProvider>
		</>
	);
}

function Training(): ReactElement {
	const Hinge = useDeterministicPick(hinge, 'hinge--');
	const Upper = useDeterministicPick(upper, 'upper--');
	const Vanity = useDeterministicPick(vanity, 'vanity--');
	const Prehab = useDeterministicPick(prehab, 'prehab--');

	return (
		<>
			<Hinge />
			<Upper />
			<Vanity />
			<Prehab />
		</>
	);
}
