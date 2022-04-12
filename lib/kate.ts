import { IKateSaveBody } from 'pages/api/kate';

type Tags = 'wellbeing' | 'wheat' | 'milk' | 'sugar' | 'stress';

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
		tags: ['wellbeing', 'stress'],
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
	17: {
		label: 'Pasta',
		tags: ['wheat'],
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

type ISODate = string;

export interface IData {
	id: ISODate;
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

type CreateSummaryByLabelReturn = Record<
	string,
	{ 1: number; 2: number; 3: number }
>;

export function createSummaryByLabel(
	data: IData[],
): CreateSummaryByLabelReturn {
	return data.reduce<CreateSummaryByLabelReturn>((acc, curr) => {
		Object.entries(curr).forEach(([key, value]) => {
			if (!acc[key]) {
				acc[key] = { 1: 0, 2: 0, 3: 0 };
			}
			if (value >= 1) {
				acc[key][1] += 1;
			}
			if (value >= 2) {
				acc[key][2] += 1;
			}
			if (value === 3) {
				acc[key][3] += 1;
			}
		});
		return acc;
	}, {});
}

type CreateSummaryByUpsetAndLabelReturn = Record<
	string,
	{ hadUpset: number; notUpset: number }
>;

export function createSummaryByUpsetAndLabel(
	data: IData[],
	upsetThreshold: 1 | 2 | 3,
	threshold: 1 | 2 | 3,
): CreateSummaryByUpsetAndLabelReturn {
	return data.reduce<CreateSummaryByUpsetAndLabelReturn>((acc, curr) => {
		const tummyUpset = curr[1];
		if (typeof tummyUpset !== 'number') return acc;

		Object.entries(curr).forEach(([key, value]) => {
			if (Number(key) === 1) return;

			const unitConfig = config[Number(key)];
			if (!unitConfig) return;

			if (unitConfig.label === 'Sleep') {
				value = 3 - value;
			}

			const hasUpset = tummyUpset >= upsetThreshold;

			if (!acc[key]) {
				acc[key] = { hadUpset: 0, notUpset: 0 };
			}

			const change = value >= threshold ? 1 : 0;

			if (hasUpset) {
				acc[key].hadUpset += change;
			} else {
				acc[key].notUpset += change;
			}
		});
		return acc;
	}, {});
}

type CreateSummaryByTagReturn = Record<
	Tags,
	{ hadUpset: number; notUpset: number }
>;

export const tags: Tags[] = ['wellbeing', 'wheat', 'milk', 'sugar', 'stress'];

export function createSummaryByTag(
	data: IData[],
	upsetThreshold: 1 | 2 | 3,
	threshold: 1 | 2 | 3,
): CreateSummaryByTagReturn {
	return data.reduce<CreateSummaryByTagReturn>(
		(acc, curr, i, arry) => {
			const tummyUpset = curr[1];
			if (typeof tummyUpset !== 'number') return acc;
			const hasUpset = tummyUpset >= upsetThreshold;

			const seenTags = new Set<Tags>();

			Object.entries(curr)
				.concat(Object.entries(arry[Math.max(i - 1, 0)]))
				.forEach(([key, value]) => {
					if (Number(key) === 1) return;

					const unitConfig = config[Number(key)];
					if (!unitConfig) return;

					if (unitConfig.label === 'Sleep') {
						value = 3 - value;
					}

					if (value < threshold) return;

					tags.forEach(tag => {
						if (unitConfig.tags.includes(tag)) {
							seenTags.add(tag);
						}
					});
				});

			[...seenTags].forEach(tag => {
				if (hasUpset) {
					acc[tag].hadUpset += 1;
				} else {
					acc[tag].notUpset += 1;
				}
			});

			return acc;
		},
		{
			wellbeing: { hadUpset: 0, notUpset: 0 },
			wheat: { hadUpset: 0, notUpset: 0 },
			milk: { hadUpset: 0, notUpset: 0 },
			sugar: { hadUpset: 0, notUpset: 0 },
			stress: { hadUpset: 0, notUpset: 0 },
		},
	);
}
