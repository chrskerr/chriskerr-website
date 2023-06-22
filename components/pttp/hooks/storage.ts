import { Dispatch, SetStateAction, useState } from 'react';

export function useLocalStorageState(
	storageKey: string,
	fallbackValue: number,
): [number, Dispatch<SetStateAction<number>>] {
	const [value, set] = useState(
		Number(localStorage.getItem(storageKey) || fallbackValue),
	);

	const setValue: Dispatch<SetStateAction<number>> = cb => {
		set(state => {
			const newValue = typeof cb === 'function' ? cb(state) : cb;
			localStorage.setItem(storageKey, String(newValue));
			return newValue;
		});
	};

	return [value, setValue];
}
