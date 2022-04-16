import { processLoop } from './helpers';

onmessage = async e => {
	const { updatedData, count } = e.data;

	return postMessage(await processLoop(updatedData, count));
};
