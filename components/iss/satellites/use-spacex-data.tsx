import throttle from 'lodash/throttle';
import sampleSize from 'lodash/sampleSize';
import take from 'lodash/take';
import { useCallback, useEffect, useState } from 'react';

import { getCoordsFromLatLng, getOrbitRadiusInPoints } from '../helpers';
import { Coords } from '../types';

type Props = {
	setTotalSatellites: (value: number) => void;
	displayedSatellites: number;
};

export default function useSpaceXData({
	setTotalSatellites,
	displayedSatellites,
}: Props) {
	const [coords, setCoords] = useState<Coords[]>([]);
	const [chosenIds, setChosenIds] = useState<string[]>();

	useEffect(() => {
		fetchData().then(data => {
			const processedData = sampleSize(
				processData(data),
				displayedSatellites,
			);
			setCoords(processedData);
			setChosenIds(processedData.map(({ id }) => id));
		});

		fetchData().then(data => {
			setCoords(processData(data));
		});

		const interval = setInterval(() => {
			fetchData().then(data => {
				setCoords(processData(data));
			});
		}, 15_000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const updateChosenIds = useCallback(
		throttle(
			(
				displayedSatellites: number,
				coords: Coords[],
				chosenIds: string[],
			) => {
				const numIds = chosenIds?.length || 0;

				if (numIds === displayedSatellites) return;
				if (numIds > displayedSatellites) {
					setChosenIds(current => take(current, displayedSatellites));
				} else {
					const unchosenCoords = coords.filter(
						({ id }) => !chosenIds?.includes(id),
					);
					const neededCoords = displayedSatellites - numIds;

					setChosenIds(current => [
						...(current || []),
						...sampleSize(unchosenCoords, neededCoords).map(
							({ id }) => id,
						),
					]);
				}
			},
			1500,
			{ trailing: true, leading: false },
		),
		[],
	);

	useEffect(() => {
		updateChosenIds(displayedSatellites, coords, chosenIds || []);
	}, [displayedSatellites]);

	useEffect(() => {
		if (coords.length > 0) setTotalSatellites(coords.length);
	}, [coords]);

	return coords.filter(({ id }) => chosenIds?.includes(id));
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

function processData(data: FilteredApiData[] | undefined): Coords[] {
	if (!data) return [];

	return data.map(row => {
		const coords = getCoordsFromLatLng(
			row.latitude,
			row.longitude * -1,
			getOrbitRadiusInPoints(row.height_km),
		);
		return {
			id: row.id,
			...coords,
		};
	});
}
