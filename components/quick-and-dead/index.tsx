
import { ReactElement, useEffect, useState } from "react";
import { Day, Week } from "./types";

import { createSession, createWeek } from "./helpers";

export default function QuickAndDead ({ urlDay, urlWeek }: { urlDay?: Day, urlWeek?: Week }): ReactElement {
	const [ day, setDay ] = useState<Day | undefined>( urlDay ); 
	const [ week, setWeek ] = useState<Week | undefined>( urlWeek );

	const doGenerate = () => {
		setDay( createSession());
	};

	const doGenerateWeek = () => {
		setWeek( createWeek());
	};

	useEffect(() => {
		setDay( urlDay );
	}, [ urlDay ]);

	useEffect(() => {
		setWeek( urlWeek );
	}, [ urlWeek ]);

	const dayUrl = day && `https://www.chriskerr.com.au/quick-and-dead/${ encodeURIComponent( btoa( JSON.stringify( day )))}`;
	const weekUrl = week && `https://www.chriskerr.com.au/quick-and-dead/${ encodeURIComponent( btoa( JSON.stringify( week )))}`;

	return (
		<div className="display-width">
			<h2 className="pb-4 text-3xl">Quick and the Dead Workout Generator</h2>
			<h2 className="pb-16 text-xl">(very much in-progress)</h2>
			<div className="mb-8">
				<button className="px-3 py-2 text-white transition rounded shadow-lg bg-brand hover:bg-brand-dark" onClick={ doGenerate }>Generate New Day</button>
				{ day && 
					<div className="mt-12">
						<p className="mb-6 text-lg">Generated session:</p>
						<p className="mb-6 text-lg">Permanent url: <a href={ dayUrl } className="break-all text-brand hover:underline">{ dayUrl }</a></p>
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
			</div>
			<div>
				<button className="px-3 py-2 text-white transition rounded shadow-lg bg-brand hover:bg-brand-dark" onClick={ doGenerateWeek }>Generate New Week</button>
				{ week && 
					<div className="mt-12">
						<p className="mb-6 text-lg">Generated Week:</p>
						<p className="mb-6 text-lg">Permanent url: <a href={ weekUrl } className="break-all text-brand hover:underline">{ weekUrl }</a></p>
						<div className="grid grid-cols-2 gap-8">
							{ week.map(( day, i ) => (
								<div key={ i } className="mb-6">
									<p className="mb-4">Day { i + 1 }</p>
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
		</div>
	);
}