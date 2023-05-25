declare module 'aimless.js' {
	export function seedFunc(seed: number): () => number;
	export function sequence<T>(
		array: [T, ...T[]],
		engine?: () => number,
	): [T, ...T[]];
	export function oneOf<T>(array: [T, ...T[]], engine?: () => number): T;
}
