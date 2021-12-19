
export const getProbability = ( frequencySeconds: number, timestampGap: number ) => {
	const probabilityWillHappen = timestampGap / ( frequencySeconds * 1000 ) ;

	return Math.random() < probabilityWillHappen;
};
