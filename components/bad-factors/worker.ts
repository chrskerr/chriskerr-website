type IWorkerInput = BigInt;

export type CustomWorker = Omit<Worker, 'postMessage'> & {
	postMessage(command: IWorkerInput): void;
};

type IWorkerResult = number[];

export interface IWorkerReturn {
	data: IWorkerResult;
}

onmessage = async e => {
	const targetNumber = Number(e.data as IWorkerInput);

	const midPoint = Math.floor(targetNumber / 2);

	const result: IWorkerResult = new Array(midPoint)
		.fill(0)
		.map((_v, i) => {
			const valueToTest = i + 1;
			const result = targetNumber / valueToTest;
			return result % 1 === 0 ? valueToTest : false;
		})
		.filter((value): value is number => !!value);

	return postMessage(result);
};
