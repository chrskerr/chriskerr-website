import { IChrisSaveBody } from 'pages/api/chris';

type Tags = 'wellbeing' | 'stress' | 'alcohol';

export const config: Record<
	number,
	{ label: string; tags: Tags[]; isArchived?: true }
> = {
	// once you've allocated a number to a data type, never change it
	// history is saved against the number, so that the label can be changed any time
	1: {
		label: 'Neck pain',
		tags: [],
	},
	2: {
		label: 'Training intensity',
		tags: ['wellbeing'],
	},
	3: {
		label: 'Work stress',
		tags: ['stress'],
	},
	4: {
		label: 'Life instability',
		tags: ['stress'],
	},
	5: {
		label: 'Alcohol',
		tags: ['alcohol'],
	},
	6: {
		label: 'Bad sleep',
		tags: ['wellbeing'],
	},
	7: {
		label: 'General fatigue',
		tags: ['wellbeing'],
	},
	8: {
		label: 'Avoidance behaviour',
		tags: ['wellbeing'],
	},
	9: {
		label: 'Doom-scrolling',
		tags: ['wellbeing'],
	},
	10: {
		label: 'Snackiness',
		tags: ['wellbeing'],
	},
	11: {
		label: 'Craving for Alcohol',
		tags: ['wellbeing'],
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

export const collectionName = 'chris_neck';

export async function saveUpdate(data: IData): Promise<{ error: boolean }> {
	const body: IChrisSaveBody = { data };
	const res = await fetch('/api/chris', {
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
	{ hadPain: number; noPain: number }
>;

export function createSummaryByUpsetAndLabel(
	data: IData[],
	soreThreshold: 1 | 2 | 3,
	threshold: 1 | 2 | 3,
): CreateSummaryByUpsetAndLabelReturn {
	return data.reduce<CreateSummaryByUpsetAndLabelReturn>((acc, curr) => {
		const neckSore = curr[1];
		if (typeof neckSore !== 'number') return acc;

		Object.entries(curr).forEach(([key, value]) => {
			if (Number(key) === 1) return;

			const unitConfig = config[Number(key)];
			if (!unitConfig) return;

			if (unitConfig.label === 'Sleep') {
				value = 3 - value;
			}

			const hasSore = neckSore >= soreThreshold;

			if (!acc[key]) {
				acc[key] = { hadPain: 0, noPain: 0 };
			}

			const change = value >= threshold ? 1 : 0;

			if (hasSore) {
				acc[key].hadPain += change;
			} else {
				acc[key].noPain += change;
			}
		});
		return acc;
	}, {});
}

type CreateSummaryByTagReturn = Record<
	Tags,
	{ hadPain: number; noPain: number }
>;

export const tags: Tags[] = ['wellbeing', 'stress', 'alcohol'];

export function createSummaryByTag(
	data: IData[],
	soreThreshold: 1 | 2 | 3,
	threshold: 1 | 2 | 3,
): CreateSummaryByTagReturn {
	return data.reduce(
		(acc, curr, i, arry): CreateSummaryByTagReturn => {
			const neckSore = curr[1];
			if (typeof neckSore !== 'number') return acc;
			const hasSore = neckSore >= soreThreshold;

			const seenTags = new Set<Tags>();

			Object.entries(curr)
				.concat(Object.entries(arry[Math.max(i - 1, 0)]))
				.forEach(([key, value]) => {
					if (Number(key) === 1) return;

					const unitConfig = config[Number(key)];
					if (!unitConfig) return;

					if (value < threshold) return;

					tags.forEach(tag => {
						if (unitConfig.tags.includes(tag)) {
							seenTags.add(tag);
						}
					});
				});

			[...seenTags].forEach(tag => {
				if (hasSore) {
					acc[tag].hadPain += 1;
				} else {
					acc[tag].noPain += 1;
				}
			});

			return acc;
		},
		{
			wellbeing: { hadPain: 0, noPain: 0 },
			stress: { hadPain: 0, noPain: 0 },
			alcohol: { hadPain: 0, noPain: 0 },
		},
	);
}
