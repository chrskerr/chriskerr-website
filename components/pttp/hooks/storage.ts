import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useLocalStorageState(
	storageKey: string,
	fallbackValue: number,
): [number, Dispatch<SetStateAction<number>>] {
	const [value, setValue] = useState(fallbackValue);

	useEffect(() => {
		const newValue = localStorage.getItem(storageKey);
		if (newValue && !isNaN(Number(newValue))) {
			setValue(Number(newValue));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(storageKey, String(value));
	}, [value]);

	return [value, setValue];
}
