import { IKateSaveBody } from 'pages/api/kate';

type Tags = 'wellbeing' | 'wheat' | 'milk' | 'sugar';

export const config: Record<
	number,
	{ label: string; tags: Tags[]; isArchived?: true }
> = {
	// once you've allocated a number to a data type, never change it
	// history is saved against the number, so that the label can be changed any time
	1: {
		label: 'Tummy upset',
		tags: ['wellbeing'],
	},
	2: {
		label: 'Stress',
		tags: ['wellbeing'],
	},
	3: {
		label: 'Sleep',
		tags: ['wellbeing'],
	},
	4: {
		label: 'Alcohol',
		tags: [],
	},
	5: {
		label: 'Sugar',
		tags: ['sugar'],
	},
	6: {
		label: 'Chocolate',
		tags: ['sugar', 'milk'],
	},
	7: {
		label: 'Ice cream',
		tags: ['sugar', 'milk'],
	},
	8: {
		label: 'Milk',
		tags: ['milk'],
	},
	9: {
		label: 'Wraps',
		tags: ['wheat'],
	},
	10: {
		label: 'Pastry',
		tags: ['wheat'],
	},
	11: {
		label: 'Bread',
		tags: ['wheat'],
	},
	12: {
		label: 'Beans',
		tags: [],
	},
	13: {
		label: 'Yoghurt',
		tags: ['milk'],
	},
	14: {
		label: 'Soft Cheese',
		tags: ['milk'],
	},
	15: {
		label: 'Hard Cheese',
		tags: ['milk'],
	},
	16: {
		label: 'Coffee',
		tags: [],
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
