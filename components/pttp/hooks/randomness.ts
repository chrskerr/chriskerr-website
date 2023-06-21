import { ReactElement, useEffect, useState } from 'react';
import { DeepReadonly, NotEmpty, WithWeight } from '../types';
import { format } from 'date-fns';

function toDateString(date = new Date()): string {
	return format(date, 'yyyymmdd');
}

function getMany<T extends { weight: number }>(
	array: DeepReadonly<NotEmpty<T>>,
	maxWeight: Readonly<number>,
): number[] {
	let tmpArray = array.map((el, i) => ({ ...el, originalIndex: i }));

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
		if (parsedValue.savedOn === toDateString()) {
			return parsedValue.value;
		}
	}

	return null;
}

function setStorage<T>(value: T, storageKey: string) {
	const toStore: StoredValue<T> = {
		savedOn: toDateString(),
		value,
	};
	localStorage.setItem(storageKey + salt, JSON.stringify(toStore));
}

function getOrSetStorage<T>(storageKey: string, createNewValue: () => T): T {
	const storedValue = fetchStorage<T>(storageKey);
	if (storedValue) {
		return storedValue;
	} else {
		const newValue = createNewValue();
		setStorage(newValue, storageKey);
		return newValue;
	}
}

export function useDeterministicPick<T>(
	array: DeepReadonly<NotEmpty<T>>,
	storageKey: Readonly<string>,
): DeepReadonly<T> {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		setIndex(
			getOrSetStorage(storageKey, () =>
				Math.floor(Math.random() * array.length),
			),
		);
	}, []);

	return array[index];
}

export function useDeterministicSample<T extends () => ReactElement>(
	array: DeepReadonly<NotEmpty<WithWeight<T>>>,
	maxWeight: Readonly<number>,
	storageKey: Readonly<string>,
): DeepReadonly<Array<T>> {
	const [indexes, setIndexes] = useState<number[]>([]);

	useEffect(() => {
		setIndexes(
			getOrSetStorage(storageKey, () => getMany(array, maxWeight)),
		);
	}, []);

	return indexes.map(i => array[i].component);
}
