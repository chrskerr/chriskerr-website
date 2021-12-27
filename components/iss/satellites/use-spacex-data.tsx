import sampleSize from 'lodash/sampleSize';
import { useEffect, useRef, useState } from 'react';

import { getCoordsFromLatLng, getOrbitRadiusInPoints } from '../helpers';
import { Coords } from '../types';

export default function useSpaceXData() {
	const [coords, setCoords] = useState<Coords[]>([]);
	const chosenIds = useRef<string[]>();

	useEffect(() => {
		fetchData().then(data => {
			const processedData = sampleSize(
				processData(data, chosenIds.current),
				150,
			);
			setCoords(processedData);
			chosenIds.current = processedData.map(({ id }) => id);
		});

		const interval = setInterval(() => {
			fetchData().then(data => {
				setCoords(processData(data, chosenIds.current));
			});
		}, 15_000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return coords;
}

type ApiData = {
	id: string;
	latitude: number | null;
	longitude: number | null;
	height_km: number | null;
};

type FilteredApiData = {
	id: string;
	latitude: number;
	longitude: number;
	height_km: number;
};

async function fetchData() {
	const res = await fetch('https://api.spacexdata.com/v4/starlink');
	if (res.ok) {
		const data = (await res.json()) as (ApiData | FilteredApiData)[];
		return data.filter((row): row is FilteredApiData => {
			return (
				typeof row.latitude === 'number' &&
				typeof row.longitude === 'number' &&
				typeof row.height_km === 'number'
			);
		});
	}
}

function processData(
	data: FilteredApiData[] | undefined,
	chosenIds: string[] | undefined,
): Coords[] {
	if (!data) return [];

	return data
		.filter(({ id }) => (chosenIds ? chosenIds.includes(id) : true))
		.map(row => {
			return {
				id: row.id,
				...getCoordsFromLatLng(
					row.latitude,
					row.longitude * -1,
					getOrbitRadiusInPoints(row.height_km),
				),
			};
		});
}
