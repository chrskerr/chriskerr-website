import { ReactElement, useEffect, useState } from 'react';
import { DeepReadonly, NotEmpty, WithWeight } from '../types';

function getCodePointProduct(str: Readonly<string>): number {
	return str
		.split('')
		.reduce<number>((acc, curr) => acc + (curr.codePointAt(0) ?? 0), 0);
}

/**
 * @returns {number} 0 to 1 (not inclusive)
 */
function getSeedFunc(salt: Readonly<string>): () => number {
	const base = 128;
	const offset = getCodePointProduct(salt);
	const seed = Math.floor((Date.now() + 36_000_000) / 86_400_000) % offset;

	let currentSeed = seed % base;

	return () => {
		currentSeed = (currentSeed * offset) % base;
		const result = Math.max(
			Math.min((currentSeed - 1) / base, 0.9999999999),
			0,
		);
		return result;
	};
}

function getOne<T>(
	array: DeepReadonly<NotEmpty<T>>,
	salt: string,
): DeepReadonly<T> {
	return array[Math.floor(getSeedFunc(salt)() * array.length)];
}

function getMany<T extends { weight: number }>(
	array: DeepReadonly<NotEmpty<T>>,
	maxWeight: Readonly<number>,
	salt: Readonly<string>,
): DeepReadonly<T>[] {
	let tmpArray = [...array];
	const result: DeepReadonly<T>[] = [];

	let allocatedWeight = 0;

	const seedFunc = getSeedFunc(salt);

	while (allocatedWeight < maxWeight) {
		const remainingWeight = maxWeight - allocatedWeight;
		if (remainingWeight <= 0) break;

		tmpArray = tmpArray.filter(curr => curr.weight <= remainingWeight);
		if (!tmpArray.length) break;

		const index = Math.floor(seedFunc() * tmpArray.length);

		const chosenExercise = tmpArray.splice(index, 1)[0];
		if (!chosenExercise) break;

		result.push(chosenExercise);
		allocatedWeight += chosenExercise.weight;
	}

	return result;
}

export function useDeterministicRange<T>(
	array: DeepReadonly<NotEmpty<T>>,
	salt: Readonly<string>,
): DeepReadonly<T> {
	const [el, setEl] = useState<DeepReadonly<T>>(getOne(array, salt));

	useEffect(() => {
		setEl(getOne(array, salt));
	}, [array, salt]);

	return el;
}

export function useDeterministicSample<T extends () => ReactElement>(
	array: DeepReadonly<NotEmpty<WithWeight<T>>>,
	maxWeight: Readonly<number>,
	salt: Readonly<string>,
): DeepReadonly<Array<WithWeight<T>>> {
	const [els, setEls] = useState<DeepReadonly<Array<WithWeight<T>>>>(
		getMany(array, maxWeight, salt),
	);

	useEffect(() => {
		setEls(getMany(array, maxWeight, salt));
	}, [salt, maxWeight, array]);

	return els;
}
