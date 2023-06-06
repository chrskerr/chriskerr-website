import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useLocalStorageState(
	storageKey: string,
	fallbackValue: number,
): [number, Dispatch<SetStateAction<number>>] {
	const [value, setValue] = useState(fallbackValue);

	useEffect(() => {
		const newValue = Number(localStorage.getItem(storageKey));
		if (newValue) {
			setValue(newValue);
		}
	}, []);

	useEffect(() => {
		if (value !== fallbackValue) {
			localStorage.setItem(storageKey, String(value));
		}
	}, [value]);

	return [value, setValue];
}
