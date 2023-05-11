import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useLocalStorageState(
	storageKey: string,
	falbackValue: number,
): [number, Dispatch<SetStateAction<number>>] {
	const [value, setValue] = useState(falbackValue);

	useEffect(() => {
		const newValue = localStorage.getItem(storageKey);
		if (newValue && !isNaN(Number(newValue))) {
			setValue(Number(newValue));
		}
	}, []);

	useEffect(() => {
		if (value) {
			localStorage.setItem(storageKey, String(value));
		}
	}, [value]);

	return [value, setValue];
}
