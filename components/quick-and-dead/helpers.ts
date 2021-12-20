
import { Rounds, Type, RepSplit, Day, Week, MinifiedType, MinifiedDay } from "./types";

const roundOptions: Rounds[] = [ 
	Rounds.TWO, 
	Rounds.THREE, 
	Rounds.THREE, 
	Rounds.FOUR, 
	Rounds.FOUR, 
	Rounds.FIVE, 
];


const getRounds = (): Rounds => {
	return roundOptions[ Math.floor( Math.random() * roundOptions.length ) ];
};

export const createSession = ( prevCycles?: Rounds ) => {
	let session: Day = {
		rounds: getRounds(),
		swingType: Math.random() > 0.5 ? Type.ONE_HANDED : Type.TWO_HANDED,
		repSplit: Math.random() > 0.5 ? RepSplit.FIVES : RepSplit.TENS,
	};
	if ( prevCycles === session.rounds ) session = createSession( prevCycles );

	return session;
};

export const createWeek = (): Week => {
	const weekInProgress = [];
	let prevSession: Day | null = null;

	for ( let i = 0; i < 7; i ++ ) {
		if ( Math.random() > 0.5 ) {
			const session = createSession( prevSession?.rounds );
			prevSession = session;
			weekInProgress.push( session );
		} else {
			weekInProgress.push( null );
		}
	}

	return weekInProgress;
};

const minifyDayObject = ( day: Day ): MinifiedDay => {
	return {
		r: day.rounds,
		s: day.repSplit,
		t: day.swingType === Type.ONE_HANDED ? MinifiedType.ONE_HANDED : MinifiedType.TWO_HANDED,
	};
};

const expandDayObject = ( day: MinifiedDay ): Day => {
	return {
		rounds: day.r,
		repSplit: day.s,
		swingType: day.t === MinifiedType.ONE_HANDED ? Type.ONE_HANDED : Type.TWO_HANDED,
	};
};

export const encode = ( data: Day | Week ): string | undefined => {
	let json = "";

	if ( !data ) return;

	if ( Array.isArray( data )) {
		const minifiedData = data.map( day => day ? minifyDayObject( day ) : null );
		json = JSON.stringify( minifiedData );
	} else {
		json = JSON.stringify( minifyDayObject( data ));
	}

	return encodeURIComponent( btoa( json ));
};

export const decode = ( input: string | string[] | undefined ) => {
	if ( typeof input !== "string" ) return;
	try {
		const data = JSON.parse( atob( decodeURIComponent( input )));

		if ( !data ) return;

		if ( Array.isArray( data )) {
			return data.map( day => day ? expandDayObject( day ) : undefined ) as Week;
		} else {
			return expandDayObject( data ) as Day;
		}

	} catch ( e ) {
		console.error( e );
		return;
	}
};