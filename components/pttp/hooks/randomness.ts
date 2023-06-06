import { ReactElement, useEffect, useState } from 'react';
import { DeepReadonly, NotEmpty, WithWeight } from '../types';

function getMany<T extends { weight: number }>(
	array: DeepReadonly<NotEmpty<T>>,
	maxWeight: Readonly<number>,
): number[] {
	let tmpArray = [...array];
	const result: number[] = [];

	let allocatedWeight = 0;

	while (allocatedWeight < maxWeight) {
		const remainingWeight = maxWeight - allocatedWeight;
		if (remainingWeight <= 0) break;

		tmpArray = tmpArray.filter(curr => curr.weight <= remainingWeight);
		if (!tmpArray.length) break;

		const index = Math.floor(Math.random() * tmpArray.length);
		const chosenExercise = tmpArray.splice(index, 1)[0];
		if (!chosenExercise) break;

		result.push(index);
		allocatedWeight += chosenExercise.weight;
	}

	return result;
}

type StoredValue<T> = {
	savedOn: string;
	value: T;
};

const salt = 'randoms';

export function useDeterministicRange<T>(
	array: DeepReadonly<NotEmpty<T>>,
	storageKey: Readonly<string>,
): DeepReadonly<T> {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const storedValue = localStorage.getItem(storageKey + salt);
		if (storedValue) {
			const parsedValue = JSON.parse(storedValue) as StoredValue<number>;
			if (parsedValue.savedOn === new Date().toDateString()) {
				setIndex(parsedValue.value);
				return;
			}
		}

		const newIndex = Math.floor(Math.random() * array.length);
		setIndex(newIndex);
		const toStore: StoredValue<number> = {
			savedOn: new Date().toDateString(),
			value: newIndex,
		};
		localStorage.setItem(storageKey + salt, JSON.stringify(toStore));
	}, []);

	return array[index];
}

export function useDeterministicSample<T extends () => ReactElement>(
	array: DeepReadonly<NotEmpty<WithWeight<T>>>,
	maxWeight: Readonly<number>,
	storageKey: Readonly<string>,
): DeepReadonly<Array<number>> {
	const [indexes, setIndexes] = useState<number[]>([]);

	useEffect(() => {
		const storedValue = localStorage.getItem(storageKey + salt);
		if (storedValue) {
			const parsedValue = JSON.parse(storedValue) as StoredValue<
				number[]
			>;
			if (parsedValue.savedOn === new Date().toDateString()) {
				setIndexes(parsedValue.value);
				return;
			}
		}

		const newIndexes = getMany(array, maxWeight);
		setIndexes(newIndexes);
		const toStore: StoredValue<number[]> = {
			savedOn: new Date().toDateString(),
			value: newIndexes,
		};
		localStorage.setItem(storageKey + salt, JSON.stringify(toStore));
	}, []);

	return indexes;
}
