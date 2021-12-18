

export const createGetFractionOfSecond = () => {
	let prevTimestamp = 0;

	return ( newTimestamp: number ) => {
		const gap = newTimestamp - prevTimestamp;
		prevTimestamp = newTimestamp;

		return gap / 1000;
	};
};