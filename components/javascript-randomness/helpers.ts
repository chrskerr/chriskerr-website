export type Data = {
	label: string;
	mathRaw: number;
	math: number;
	cryptoRaw: number;
	crypto: number;
};

export const sampleSizes = [
	{ label: 'Ten', value: 10 },
	{ label: 'One Hundred', value: 100 },
	{ label: 'One Thousand', value: 1_000 },
	{ label: 'Ten Thousand', value: 10_000 },
	{ label: "One Hundred Thousand (this'll take a sec)", value: 100_000 },
	{ label: "One Million (this'll take a while)", value: 1_000_000 },
	{ label: 'Ten Million (this might not finish...)', value: 10_000_000 },
	{
		label: "One Hundred Million (don't choose this one)",
		value: 100_000_000,
	},
];

export const numDataGroups = 20;

const getCryptoRandomNumbers = (count: number): number[] => {
	return Array.from(crypto.getRandomValues(new Uint8Array(count))).map(curr =>
		Math.floor((curr / 256) * numDataGroups),
	);
};

const getMathRandomNumbers = (count: number): number[] => {
	return new Array(count)
		.fill(0)
		.map(() => Math.floor(Math.random() * numDataGroups));
};

const newDataSummary = (
	mode: 'math' | 'crypto',
	count: number,
): Record<string, number> => {
	const numbers =
		mode === 'math'
			? getMathRandomNumbers(count)
			: getCryptoRandomNumbers(count);

	return numbers.reduce<Record<string, number>>((acc, curr) => {
		return {
			...acc,
			[curr]: (acc[curr] || 0) + 1,
		};
	}, {});
};

export const chunkSize = 25_000;

export const processLoop = (data: Data[], numSamples: number): Data[] => {
	const newMathSummary = newDataSummary('math', numSamples);
	const newCryptoSummary = newDataSummary('crypto', numSamples);

	let totalMathRaw = 0;
	let totalCryptoRaw = 0;

	const normalisedData: Data[] = data
		.map(datum => {
			const mathRaw = datum.mathRaw + (newMathSummary[datum.label] || 0);
			const cryptoRaw =
				datum.cryptoRaw + (newCryptoSummary[datum.label] || 0);

			totalMathRaw += mathRaw;
			totalCryptoRaw += cryptoRaw;

			return { ...datum, mathRaw, cryptoRaw };
		})
		.map(datum => ({
			...datum,
			math: (datum.mathRaw / totalMathRaw) * 100,
			crypto: (datum.cryptoRaw / totalCryptoRaw) * 100,
		}));

	return normalisedData;
};
