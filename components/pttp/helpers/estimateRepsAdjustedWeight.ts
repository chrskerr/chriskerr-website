import { to2dot5 } from './createWeightsData';

export type Reps = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 15 | 20;

const multipliers: Record<Reps, number> = {
	1: 1,
	2: 0.93,
	3: 0.91,
	4: 0.885,
	5: 0.86,
	6: 0.83,
	7: 0.81,
	8: 0.77,
	9: 0.76,
	10: 0.73,
	12: 0.67,
	15: 0.625,
	20: 0.5,
};

export function estimateRepsAdjustedWeight(oneRm: number, reps: Reps) {
	return to2dot5(oneRm * multipliers[reps]);
}
