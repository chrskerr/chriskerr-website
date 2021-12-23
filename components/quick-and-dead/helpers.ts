
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { Rounds, Type, RepSplit, Day, Week, MinifiedType, MinifiedDay, MinifiedWeek } from "types/quick-and-dead";

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

	const numSessions = weekInProgress.filter( Boolean ).length;

	return numSessions < 2 || numSessions > 6 ? createWeek() : weekInProgress;
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
	let jsonString = "";

	if ( !data ) return;

	if ( Array.isArray( data )) {
		const minifiedData = data.map( day => day ? minifyDayObject( day ) : null );
		jsonString = JSON.stringify( minifiedData );
	} else {
		jsonString = JSON.stringify( minifyDayObject( data ));
	}

	return compressToEncodedURIComponent( jsonString );
};

export const decode = ( input: string | string[] | undefined ) => {
	if ( typeof input !== "string" ) return;
	try {
		const jsonString = decompressFromEncodedURIComponent( input );
		const data = jsonString ? JSON.parse( jsonString ) as MinifiedWeek | MinifiedDay : null;

		if ( !data ) return;

		if ( Array.isArray( data )) {
			return data.map( day => day ? expandDayObject( day ) : null );
		} else {
			return expandDayObject( data ) as Day;
		}

	} catch ( e ) {
		console.error( e );
		return;
	}
};