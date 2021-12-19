
type Queue<T, R> = {
	resolve: ( data: R ) => void,
	input: T,
}[]

type Options<T> = {
	sortByKey?: keyof T,
}

export function serialise<T, R>( func: ( input: T ) => R, options?: Options<T> ): (( input: T ) => Promise<R> ) {
	let queue: Queue<T, R> = [];
	let isRunning = false;

	async function run () {
		isRunning = true;

		const result = await func( queue[ 0 ].input );
		queue[ 0 ].resolve( result );
		
		queue.shift();
		
		if ( queue.length ) await run();

		isRunning = false;
	}

	return async function ( input: T ): Promise<R> {
		return await new Promise<R>( resolve => {
			
			const item = { resolve, input };

			if ( options?.sortByKey ) {
				const key = options.sortByKey;
				queue = [ ...queue, item ].sort(( a, b ) => Number( a.input[ key ]) - Number( b.input[ key ]));

			} else {
				queue.push( item );

			}

			if ( !isRunning ) run();
		});
	}; 
}