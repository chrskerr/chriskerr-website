import { useEffect, useState } from 'react';
import { getCurrentCoords } from './helpers';

import type { ISSData } from './types';

export default function useIss() {
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

async function fetchIssData(): Promise<ISSData | undefined> {
	const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
	if (res.ok) {
		const data = (await res.json()) as ISSData;
		return data;
	}
}
