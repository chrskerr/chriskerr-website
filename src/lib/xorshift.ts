export class XORShift {
	private state: bigint;

	constructor(seed = Date.now()) {
		// Initialize the state with a non-zero seed
		this.state = BigInt(seed) || 1n;
	}

	// Generate the next pseudorandom number
	next() {
		// XORShift algorithm steps
		this.state ^= this.state << 13n;
		this.state ^= this.state >> 7n;
		this.state ^= this.state << 17n;

		// Return a positive number between 0 and 2^32 - 1
		return Number(this.state & 0xffffffffn);
	}

	// Get a random number between 0 and 1
	random() {
		return this.next() / 0xffffffff;
	}

	// Get a random integer between min and max (inclusive)
	randomInt(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(this.random() * (max - min + 1)) + min;
	}
}
