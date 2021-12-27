import { useEffect, useState } from 'react';

import chunk from 'lodash/chunk';
import padStart from 'lodash/padStart';

import { AllObservationsJSON, Coords, ObservationJSON } from '../types';
import {
	radiusOfEarth,
	getCoordsFromLatLng,
	getOrbitRadiusInPoints,
} from '../helpers';

export default function useNasaData() {
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
			const processSatellites = async () => {
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
			};

			processSatellites();

			interval = setInterval(processSatellites, 60_000);
		}

		return () => {
			clearInterval(interval);
		};
	}, [satelliteList]);

	return coords;
}

// https://sscweb.gsfc.nasa.gov/WebServices/REST/

function processObservationJSON(input: ObservationJSON): {
	id: string;
	lat: number;
	lng: number;
	altitude: number;
} {
	const coordinates =
		input.Coordinates && input.Coordinates[1] && input.Coordinates[1][0];

	return {
		id: input.Id,
		lat: coordinates?.Latitude[1][1] || 0,
		lng: (coordinates?.Longitude[1][1] || 0) * -1,
		altitude: (input.RadialLength[1][1] || radiusOfEarth) - radiusOfEarth,
	};
}

async function fetchAllLocations(excludedIds: string[]) {
	const res = await fetch(
		'https://sscweb.gsfc.nasa.gov/WS/sscr/2/observatories',
		{ headers: { accept: 'application/json' } },
	);
	if (res.ok) {
		const data = (await res.json()) as {
			Observatory: [string, AllObservationsJSON[]];
		};

		const now = new Date();

		return (
			data?.Observatory[1]?.filter(observation => {
				try {
					if (excludedIds.includes(observation.Id)) return false;

					const endTime = new Date(observation.EndTime[1]);
					if (endTime < now) return false;

					const startTime = new Date(observation.StartTime[1]);
					if (startTime > now) return false;

					if (observation.Resolution > 60) return false;

					return true;
				} catch (e) {
					console.log('error', observation, e);
					return false;
				}
			}) || []
		);
	}
}

async function fetchCurrentForLocations(
	locations: string,
	start: string,
	end: string,
) {
	const res = await fetch(
		`https://sscweb.gsfc.nasa.gov/WS/sscr/2/locations/${locations}/${start},${end}/gse/`,
		{ headers: { accept: 'application/json' } },
	);
	if (res.ok) {
		const data = (await res.json()) as {
			Result: {
				Data: [string, ObservationJSON[]];
			};
		};
		return data?.Result?.Data[1];
	}
}

const padInput = (input: number, length = 2) =>
	padStart(String(input), length, '0');

function createUTCString(date: Date) {
	return `${padInput(date.getUTCFullYear(), 4)}${padInput(
		date.getUTCMonth() + 1,
	)}${padInput(date.getUTCDate())}T${padInput(date.getUTCHours())}${padInput(
		date.getUTCMinutes(),
	)}${padInput(date.getUTCSeconds())}Z`;
}

const updateSatelliteData = async (
	satelliteList: AllObservationsJSON[],
	excludedIds: string[],
) => {
	const now = new Date();

	const end = createUTCString(now);
	now.setMinutes(now.getMinutes() - 2);
	const start = createUTCString(now);

	const chunks = chunk(
		satelliteList.filter(({ Id }) => !excludedIds.includes(Id)),
		10,
	);

	const processedData = (
		await Promise.all(
			chunks.map(async chunk => {
				const locations = chunk.map(({ Id }) => Id).join(',');
				const data = await fetchCurrentForLocations(
					locations,
					start,
					end,
				);

				return data?.map(processObservationJSON) || [];
			}),
		)
	).flat();

	return processedData.map(sat => {
		const vector = getCoordsFromLatLng(
			sat.lat,
			sat.lat,
			getOrbitRadiusInPoints(sat.altitude),
		);

		return {
			id: sat.id,
			...vector,
		};
	});
};
