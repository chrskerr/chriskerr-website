
type Queue<T, Q> = {
	resolve: ( result: Q ) => void,
	input: T,
}[]

type SerializeOptions<T, R> = {
	delay?: number,
	sortBy?: {
		key: keyof T,
		direction?: "asc" | "desc",
	},
	passForwardDataCallback?: ( input: T, previousResult: R ) => Promise<T>,
}

type Result<R> = { 
	data?: R,
	error?: unknown,
}

export default function serialize<T, R, Q extends Result<R>>( func: ( input: T ) => R, options?: SerializeOptions<T, R> ): (( input: T ) => Promise<Q> ) {
	let queue: Queue<T, Q> = [];
	let isRunning = false;
	let previousResult: R | undefined = undefined;

	async function run () {
		const prevRunning = isRunning;
		isRunning = true;

		const current = queue[ 0 ];

		if ( !prevRunning && options?.delay ) {
			await new Promise( resolve => setTimeout( resolve, options.delay ));
		}

		if ( options?.passForwardDataCallback && previousResult ) {
			current.input = await options.passForwardDataCallback( current.input, previousResult );
		}

		try {
			const result = await func( current.input );
			current.resolve({ data: result } as unknown as Q );

			previousResult = result;

		} catch ( error ) {
			current.resolve({ error } as Q );
			
		}

		
		queue.shift();
		
		if ( queue.length ) await run();

		isRunning = false;
	}

	return async function ( input: T ): Promise<Q> {
		return await new Promise<Q>( resolve => {
			
			const item = { resolve, input };

			if ( options?.sortBy ) {
				const key = options.sortBy.key;
				queue = [ ...queue, item ]
					.sort(( a, b ) => options.sortBy?.direction === "desc" ? 
						Number( b.input[ key ]) - Number( a.input[ key ]) :
						Number( a.input[ key ]) - Number( b.input[ key ]),
					);

			} else {
				queue.push( item );

			}

			if ( !isRunning ) run();
		});
	}; 
}