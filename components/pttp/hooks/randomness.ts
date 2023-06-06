import { ReactElement, useEffect, useState } from 'react';
import { DeepReadonly, NotEmpty, WithWeight } from '../types';

function getMany<T extends { weight: number }>(
	array: DeepReadonly<NotEmpty<T>>,
	maxWeight: Readonly<number>,
): number[] {
	const tmpArray = array
		.map((el, i) => ({ ...el, originalIndex: i }))
		.sort(() => Math.random() - 0.5);
	const result: number[] = [];

	let allocatedWeight = 0;
	let i = 0;

	while (allocatedWeight < maxWeight) {
		const remainingWeight = maxWeight - allocatedWeight;
		if (remainingWeight <= 0) break;

		const chosenExercise = tmpArray[i++];
		if (!chosenExercise) break;

		if (chosenExercise.weight > remainingWeight) {
			continue;
		}

		result.push(chosenExercise.originalIndex);
		allocatedWeight += chosenExercise.weight;
	}

	return result;
}

type StoredValue<T> = {
	savedOn: string;
	value: T;
};

const salt = 'randoms';

function fetchStorage<T>(storageKey: string): T | null {
	const storedValue = localStorage.getItem(storageKey + salt);
	if (storedValue) {
		const parsedValue = JSON.parse(storedValue) as StoredValue<T>;
		if (parsedValue.savedOn === new Date().toDateString()) {
			return parsedValue.value;
		}
	}

	return null;
}

function setStorage<T>(value: T, storageKey: string) {
	const toStore: StoredValue<T> = {
		savedOn: new Date().toDateString(),
		value,
	};
	localStorage.setItem(storageKey + salt, JSON.stringify(toStore));
}

function getOrSetStorage<T>(
	storageKey: string,
	createNewValue: () => T,
	setValue: (value: T) => void,
) {
	const storedValue = fetchStorage<T>(storageKey);
	if (storedValue) {
		setValue(storedValue);
	} else {
		const newValue = createNewValue();
		setValue(newValue);
		setStorage(newValue, storageKey);
	}
}

export function useDeterministicRange<T>(
	array: DeepReadonly<NotEmpty<T>>,
	storageKey: Readonly<string>,
): DeepReadonly<T> {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		getOrSetStorage(
			storageKey,
			() => Math.floor(Math.random() * array.length),
			setIndex,
		);
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
		getOrSetStorage(
			storageKey,
			() => getMany(array, maxWeight),
			setIndexes,
		);
	}, []);

	return indexes;
}
