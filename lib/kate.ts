import { IKateSaveBody } from 'pages/api/kate';

export const config: Record<
	number,
	{ label: string; category: 'general' | 'food' | 'drink' }
> = {
	// once you've allocated a number to a data type, never change it
	// history is saved against the number, so that the label can be changed any time
	1: {
		label: 'Tummy upsetness',
		category: 'general',
	},
};

const defaultData = Object.keys(config).reduce<IData>(
	(acc, curr) => {
		return {
			...acc,
			[curr]: null,
		};
	},
	{ id: '' },
);

export interface IData {
	id: string;
	[k: keyof typeof config]: undefined | 0 | 1 | 2 | 3;
}

export function addMissingKeys(input: Partial<IData>): IData {
	if (!input.id) {
		throw new Error('Cannot add id');
	}

	return {
		...defaultData,
		...input,
	};
}

export function getLabel(key: number) {
	return config[key]?.label || 'Label not found';
}

export const collectionName = 'kate_food';

export async function saveUpdate(data: IData): Promise<{ error: boolean }> {
	const body: IKateSaveBody = { data };
	const res = await fetch('/api/kate', {
		method: 'post',
		body: JSON.stringify(body),
		credentials: 'include',
		headers: {
			'content-type': 'application/json',
		},
	});
	if (!res.ok) return { error: true };
	return { error: false };
}
