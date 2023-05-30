import { ReactElement } from 'react';

export type WithWeight<T extends () => ReactElement> = {
	component: T;
	weight: number;
};

export type NotEmpty<T> = [T, ...T[]];

export type DeepReadonly<T> = T extends (infer R)[]
	? DeepReadonlyArray<R>
	: // eslint-disable-next-line @typescript-eslint/ban-types
	T extends Function
	? T
	: T extends object
	? DeepReadonlyObject<T>
	: T;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
	readonly [P in keyof T]: DeepReadonly<T[P]>;
};
