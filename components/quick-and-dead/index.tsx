
import { NextSeo } from "next-seo";
import { ReactElement, useEffect, useState } from "react";
import { Day, Week } from "types/quick-and-dead";

import { createSession, createWeek, encode } from "./helpers";

const baseUrl = `${ process.env.NEXT_PUBLIC_URL_BASE || "http://localhost:3000" }/quick-and-dead`;
const title = "Quick and the Dead Workout Generator";

export default function QuickAndDead ({ urlDay, urlWeek }: { urlDay?: Day, urlWeek?: Week }): ReactElement {
	const [ day, setDay ] = useState<Day | undefined>( urlDay ); 
	const [ dayUrl, setDayUrl ] = useState<string | undefined>( undefined );

	const [ week, setWeek ] = useState<Week | undefined>( urlWeek );
	const [ weekUrl, setWeekUrl ] = useState<string | undefined>( undefined );

	const doGenerate = () => {
		setDay( createSession());
		setWeek( undefined );
	};

	const doGenerateWeek = () => {
		setWeek( createWeek());
		setDay( undefined );
	};

	useEffect(() => {
		setDay( urlDay );
	}, [ urlDay ]);

	useEffect(() => {
		setWeek( urlWeek );
	}, [ urlWeek ]);

	useEffect(() => {
		setDayUrl( day ? `${baseUrl}/${ encode( day )}` : undefined );
	}, [ day ]);

	useEffect(() => {
		setWeekUrl( week ? `${baseUrl}/${ encode( week )}` : undefined );
	}, [ week ]);

	const buttonClasses = "button mr-4 mb-4";

	return (
		<>
			<NextSeo 
				title={ title }
				description="A workout generator for Pavel's The Quick and The Dead"
				canonical={ baseUrl }
			/>
			<div className="display-width">
				<h2 className="pb-4 text-3xl">{ title }</h2>
				<p className="pb-4 text-xl">A workout generator for Pavel&apos;s The Quick and The Dead</p>
				<p className="pb-16 text-xl">(very much in-progress)</p>
				<div>
					<button className={ buttonClasses } onClick={ doGenerate }>Generate New Day</button>
					<button className={ buttonClasses } onClick={ doGenerateWeek }>Generate New Week</button>
				</div>

				{ day && 
					<div className="mt-4">
						<p className="mb-6 text-lg">Permanent url: <a href={ dayUrl } className="break-all text-brand hover:underline">{ dayUrl }</a></p>
						<p className="mb-2 font-bold">Today</p>
						<div className="grid grid-cols-2 gap-x-12 w-[fit-content]">
							<p className="mb-2">Rounds:</p>
							<p className="mb-2 font-bold">{ day.rounds }</p>
							<p className="mb-2">Swing Type:</p>
							<p className="mb-2 font-bold">{ day.swingType }</p>
							<p className="mb-2">Split reps into sets of:</p>
							<p className="mb-2 font-bold">{ day.repSplit }&apos;s</p>
						</div>
					</div>
				}
				{ week && 
					<div className="mt-4">
						<p className="mb-6 text-lg">Permanent url: <a href={ weekUrl } className="break-all text-brand hover:underline">{ weekUrl }</a></p>
						<div className="grid grid-cols-2 gap-4">
							{ week.map(( day, i ) => (
								<div key={ i } className="mb-6">
									<p className="mb-2 font-bold">Day { i + 1 }</p>
									{ day ? 
										<div className="grid grid-cols-2 w-[fit-content]">
											<p className="mb-2 mr-12">Rounds:</p>
											<p className="mb-2 font-bold">{ day.rounds }</p>
											<p className="mb-2 mr-12">Swing Type:</p>
											<p className="mb-2 font-bold">{ day.swingType }</p>
											<p className="mb-2 mr-12">Split reps into sets of:</p>
											<p className="mb-2 font-bold">{ day.repSplit }&apos;s</p>
										</div> : 
										<p>Rest Day 🎉</p>
									}
								</div>
							))}
						</div>
					</div>
				}
			</div>
		</>
	);
}