import padEnd from 'lodash/padEnd';

function getPlatesString(weight: number, includesBar = true): string {
	let remainingWeight = weight - (includesBar ? 20 : 0);
	let str = '';

	while (remainingWeight > 0) {
		if (str) {
			str += ',';
		}

		if (remainingWeight >= 50) {
			str += ' 25';
			remainingWeight -= 50;
		} else if (remainingWeight >= 40) {
			str += ' 20';
			remainingWeight -= 40;
		} else if (remainingWeight >= 30) {
			str += ' 15';
			remainingWeight -= 30;
		} else if (remainingWeight >= 20) {
			str += ' 10';
			remainingWeight -= 20;
		} else if (remainingWeight >= 10) {
			str += ' 5';
			remainingWeight -= 10;
		} else if (remainingWeight >= 5) {
			str += ' 2.5';
			remainingWeight -= 5;
		} else if (remainingWeight >= 2.5) {
			str += ' 1.25';
			remainingWeight -= 2.5;
		} else {
			remainingWeight = 0;
		}
	}

	return str.trim();
}

type WeightsData = {
	plates: string;
	weights: { label: string; value: string }[];
};

export function createWeightsData(
	weight: number,
	steps: number[],
): WeightsData {
	const stepWeights = steps
		.sort()
		.map(step => Math.max(to2dot5(weight * step), 20));

	let str = '';

	for (let i = 0; i < stepWeights.length; i++) {
		const step = steps[i];
		const stepWeight = stepWeights[i];
		const prevWeight = stepWeights[i - 1];
		if (step && stepWeight) {
			if (i === 0) {
				str += padEnd(` ${step * 100}%:`, 9, ' ');
			} else {
				str += '\n';
				str += padEnd(` ${step * 100}%:`, 7, ' ') + '+ ';
			}

			const newStr = prevWeight
				? getPlatesString(stepWeight - prevWeight, false)
				: getPlatesString(stepWeight);

			str += newStr;
		}
	}

	return {
		weights: stepWeights
			.map((weight, i) => ({
				label: `${(steps[i] ?? 0) * 100}%`,
				value: `${weight}kg`,
			}))
			.reverse(),
		plates: str,
	};
}

export function to2dot5(input: number): number {
	return (Math.round((input * 4) / 10) / 4) * 10;
}
