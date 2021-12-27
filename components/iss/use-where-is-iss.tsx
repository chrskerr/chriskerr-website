import { useEffect, useState } from 'react';
import { getCurrentCoords, fetchIssData } from './helpers';

import type { ISSData } from './types';

export default function useWhereIsISS() {
	const [data, setData] = useState<ISSData>();

	useEffect(() => {
		fetchIssData().then(data => {
			if (data) setData(data);
		});

		const interval = setInterval(() => {
			fetchIssData().then(data => {
				if (data) setData(data);
			});
		}, 5_000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return getCurrentCoords(data);
}
