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

	const results: IWorkerResult = [];
	for (let i = 1; i <= midPoint; i++) {
		const result = targetNumber / i;
		if (result % 1 === 0) results.push(i);
	}

	return postMessage(results);
};
