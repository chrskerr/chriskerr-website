import { Data, processLoop } from './helpers';

interface IWorkerInput {
	updatedData: Data[];
	count: number;
}

export type CustomWorker = Omit<Worker, 'postMessage'> & {
	postMessage(command: IWorkerInput): void;
};

type IWorkerResult = Data[];

export interface IWorkerReturn {
	data: IWorkerResult;
}

onmessage = async e => {
	const { updatedData, count } = e.data as IWorkerInput;
	const result: IWorkerResult = processLoop(updatedData, count);
	return postMessage(result);
};
