import { ReactElement } from 'react';

export type WithWeight<T extends () => ReactElement> = {
	component: T;
	weight: number;
	key: string;
};

export type NotEmpty<T> = [T, ...T[]];
