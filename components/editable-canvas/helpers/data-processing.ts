
export function serialise<T>( 
	func: (( input: T ) => void ) | (( input: T ) => Promise<void> ),
	sortByKey: keyof T,
) {
	let queue: T[] = [];
	let isRunning = false;

	async function run () {
		isRunning = true;
		await func( queue[ 0 ]);
		queue.shift();
		
		if ( queue.length ) await run();

		isRunning = false;
	}

	return function ( input: T ) {
		if ( sortByKey ) {
			queue = [ ...queue, input ].sort(( a, b ) => Number( a[ sortByKey ]) - Number( b[ sortByKey ]));

		} else {
			queue.push( input );

		}
			
		if ( !isRunning ) run();
	}; 
}