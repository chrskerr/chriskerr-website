import { useEffect, useState } from 'react';
import { fetchAllLocations, updateSatelliteData } from '../helpers';

import { AllObservationsJSON, Coords } from '../types';

export default function useAllSatellites() {
	const [satelliteList, setSatelliteList] = useState<AllObservationsJSON[]>();
	const [excludedIds, setExcludedIds] = useState([
		'sun',
		'moon',
		'parkersppred',
		'spitzer',
		'arasepred',
		'solarorbiter',
		'iss',
	]);

	const [coords, setCoords] = useState<Coords[]>([]);

	useEffect(() => {
		fetchAllLocations(excludedIds).then(data => {
			setSatelliteList(data);
		});
	}, []);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;

		if (satelliteList) {
			interval = setInterval(async () => {
				const vectors = await updateSatelliteData(
					satelliteList,
					excludedIds,
				);

				const newExcludedIds = vectors
					.filter(({ x, y, z }) => x > 15 || y > 15 || z > 15)
					.map(({ id }) => id);
				setExcludedIds(curr => [...curr, ...newExcludedIds]);

				setCoords(
					vectors.filter(({ x, y, z }) => x < 15 && y < 15 && z < 15),
				);
			}, 60_000);
		}

		return () => {
			clearInterval(interval);
		};
	}, [satelliteList]);

	return coords;
}

// https://sscweb.gsfc.nasa.gov/WebServices/REST/
