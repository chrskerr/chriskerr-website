import { NextSeo } from 'next-seo';
import { ReactElement, useEffect, useState } from 'react';
import { Day, Type, Week } from 'types/quick-and-dead';

import { createSession, createWeek, encode } from './helpers';

const baseUrl = `${
	process.env.NEXT_PUBLIC_URL_BASE || 'http://localhost:3000'
}/quick-and-dead`;
const title = 'Quick and the Dead Workout Generator';

export default function QuickAndDead({
	urlDay,
	urlWeek,
}: {
	urlDay?: Day;
	urlWeek?: Week;
}): ReactElement {
	const [day, setDay] = useState<Day | undefined>(urlDay);
	const [dayUrl, setDayUrl] = useState<string | undefined>(undefined);

	const [week, setWeek] = useState<Week | undefined>(urlWeek);
	const [weekUrl, setWeekUrl] = useState<string | undefined>(undefined);

	const doGenerate = () => {
		setDay(createSession());
		setWeek(undefined);
	};

	const doGenerateWeek = () => {
		setWeek(createWeek());
		setDay(undefined);
	};

	useEffect(() => {
		setDay(urlDay);
	}, [urlDay]);

	useEffect(() => {
		setWeek(urlWeek);
	}, [urlWeek]);

	useEffect(() => {
		setDayUrl(day ? `${baseUrl}/${encode(day)}` : undefined);
	}, [day]);

	useEffect(() => {
		setWeekUrl(week ? `${baseUrl}/${encode(week)}` : undefined);
	}, [week]);

	return (
		<>
			<NextSeo
				title={title}
				description="A workout generator for Pavel's The Quick and The Dead"
				canonical={baseUrl}
			/>
			<div className="display-width">
				<h2 className="pb-4 text-3xl">{title}</h2>
				<p className="pb-12 text-xl">
					A workout generator for Pavel&apos;s The Quick and The Dead
				</p>
				<div>
					<button
						className="mb-4 mr-4 uppercase button maroon"
						onClick={doGenerate}
					>
						Generate Session
					</button>
					<button
						className="mb-4 mr-4 uppercase button dark"
						onClick={doGenerateWeek}
					>
						Generate Week
					</button>
				</div>
			</div>
			<div className="display-width divider-before">
				{day && (
					<div>
						<div>
							<p className="mb-2 font-bold">Session</p>
							<DayRenderer day={day} colour="maroon" />
						</div>
						<p className="mt-6">
							Permanent url:{' '}
							<a
								href={dayUrl}
								className="break-all text-brand hover:underline"
							>
								{dayUrl}
							</a>
						</p>
					</div>
				)}
				{week && (
					<div>
						<div className="grid grid-cols-2 gap-4">
							{week.map((day, i) => (
								<div key={i} className="mb-6">
									<p className="mb-2 font-bold">
										Day {i + 1}
									</p>
									<DayRenderer day={day} colour="blue" />
								</div>
							))}
						</div>
						<p className="mt-6">
							Permanent url:{' '}
							<a
								href={weekUrl}
								className="break-all text-brand hover:underline"
							>
								{weekUrl}
							</a>
						</p>
					</div>
				)}
			</div>
		</>
	);
}

function DayRenderer({
	day,
	colour,
}: {
	day: Day | null;
	colour: 'blue' | 'maroon';
}): ReactElement {
	return (
		<div className="grid w-[fit-content] grid-cols-3 gap-4">
			{day ? (
				<>
					<Cell
						content={String(day.rounds)}
						colour={colour}
						subContent="Rounds"
					/>
					<Cell
						content={String(
							day.swingType === Type.TWO_HANDED ? 2 : 1,
						)}
						colour={colour}
						subContent="Handed"
					/>
					<Cell
						content={String(day.repSplit)}
						colour={colour}
						subContent="Reps"
					/>
				</>
			) : (
				<Cell content="🎉" colour={colour} subContent="Rest" />
			)}
		</div>
	);
}

function Cell({
	content,
	subContent,
	colour,
}: {
	content: string;
	subContent: string;
	colour: 'blue' | 'maroon';
}): ReactElement {
	return (
		<div
			className={`${
				colour === 'blue' ? 'bg-brand-dark' : 'bg-brand-maroon'
			} rounded text-white aspect-square w-[75px] flex flex-col justify-center items-center shadow-md`}
		>
			<p className="text-4xl">{content}</p>
			<p className="text-sm uppercase">{subContent}</p>
		</div>
	);
}
