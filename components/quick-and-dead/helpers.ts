
import { Rounds, Type, RepSplit, Day, Week } from "./types";

const roundOptions: Rounds[] = [ 
	Rounds.TWO, 
	Rounds.THREE, 
	Rounds.THREE, 
	Rounds.FOUR, 
	Rounds.FOUR, 
	Rounds.FIVE, 
];


const getCycles = (): Rounds => {
	return roundOptions[ Math.floor( Math.random() * roundOptions.length ) ];
};

export const createSession = ( prevCycles?: Rounds ) => {
	let session: Day = {
		cycles: getCycles(),
		swingType: Math.random() > 0.5 ? Type.ONE_HANDED : Type.TWO_HANDED,
		repSplit: Math.random() > 0.5 ? RepSplit.FIVES : RepSplit.TENS,
	};
	if ( prevCycles === session.cycles ) session = createSession( prevCycles );

	return session;
};

export const createWeek = (): Week => {
	const weekInProgress = [];
	let prevSession: Day | undefined = undefined;

	for ( let i = 0; i < 7; i ++ ) {
		if ( Math.random() > 0.5 ) {
			const session = createSession( prevSession?.cycles );
			prevSession = session;
			weekInProgress.push( session );
		} else {
			weekInProgress.push( undefined );
		}
	}

	return weekInProgress;
};