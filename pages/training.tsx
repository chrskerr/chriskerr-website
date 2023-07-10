import { ReactElement, useEffect, useState } from 'react';

import { NextSeo } from 'next-seo';

import {
	AlternatingCableCurls,
	Bench,
	CalfRaiseMachine,
	Deadlift,
	LungeWalking,
	OneHandedSwings,
	PlateSitup,
	PullUps,
	Rowing,
	Squats,
	Swings,
	TurkishGetUp,
	Warmup,
} from 'components/pttp/prefabs/chris';
import {
	useDeterministicPick,
	useDeterministicSample,
	useRandomNumber,
} from 'components/pttp/hooks/randomness';
import { DeepReadonly, NotEmpty, WithWeight } from 'components/pttp/types';
import { DisableClickConstraintContextProvider } from 'components/pttp/context/disableClickConstraint';

const title = 'Training tracker';

type Exercises = DeepReadonly<NotEmpty<() => ReactElement>>;

type ExercisesWithWeight = DeepReadonly<
	NotEmpty<WithWeight<() => ReactElement>>
>;

const hinge: Exercises = [Deadlift, Swings, OneHandedSwings, Squats];
const upper: Exercises = [Bench, Bench, TurkishGetUp];
const otherStrength: ExercisesWithWeight = [
	{ weight: 5, component: AlternatingCableCurls },
	{ weight: 10, component: PullUps },
	{ weight: 16, component: Rowing },
	{ weight: 10, component: CalfRaiseMachine },
	{ weight: 10, component: LungeWalking },
	{ weight: 10, component: PlateSitup },
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

			{render && <Training />}
		</>
	);
}

const totalWorkoutTimeMins = 90;

function Training(): ReactElement {
	const aerobicMins = useRandomNumber(30, 60, 'aerobic-mins--');
	const aerobicType = useDeterministicPick(
		['running', 'incline walking'],
		'aerobic-type--',
	);

	const Hinge = useDeterministicPick(hinge, 'hinge--'); // 15 mins
	const Upper = useDeterministicPick(upper, 'upper--'); // 15 mins

	const remainingStrengthMins = Math.max(
		totalWorkoutTimeMins - 15 - 15 - aerobicMins,
		0,
	);

	const strength = useDeterministicSample(
		otherStrength,
		remainingStrengthMins,
		'remaining-strength--',
	);

	return (
		<>
			<div className="display-width divider-before">
				<p>
					Aerobic mins today: {aerobicMins} {aerobicType}
				</p>
			</div>

			<DisableClickConstraintContextProvider>
				<Warmup />
				<Hinge />
				<Upper />
				{strength.map((Component, i) => (
					<Component key={i} />
				))}
			</DisableClickConstraintContextProvider>
		</>
	);
}
