import { useEffect, useState } from 'react';
import { getCurrentCoords, fetchIssData } from './helpers';

import type { ISSData } from './types';

export default function useWhereIsISS() {
	const [data, setData] = useState<ISSData>();

	useEffect(() => {
		const interval = setInterval(async () => {
			setData(await fetchIssData());
		}, 1500);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return getCurrentCoords(data);
}
