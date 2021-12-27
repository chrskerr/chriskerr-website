import { AllObservationsJSON, ISSData, ObservationJSON } from './types';

/**
 * Radius at equator in KM
 */
export const radiusOfEarth = 6378;
const kmPerPoint = radiusOfEarth / 5;

export function getOrbitRadiusInPoints(altitude: number) {
	return (altitude + radiusOfEarth) / kmPerPoint;
}

/**
 * Length in M
 */
const issLength = 73;

export function getIssScaledLength(points: number) {
	const targetPoints = issLength / 1000 / kmPerPoint;
	return targetPoints / points;
}

export function getCoordsFromLatLng(
	lat: number,
	lng: number,
	altitude: number,
) {
	const cosLat = Math.cos((lat * Math.PI) / 180.0);
	const sinLat = Math.sin((lat * Math.PI) / 180.0);
	const cosLon = Math.cos((lng * Math.PI) / 180.0);
	const sinLon = Math.sin((lng * Math.PI) / 180.0);

	return {
		x: altitude * cosLat * cosLon,
		z: altitude * cosLat * sinLon,
		y: altitude * sinLat,
	};
}

export function getCurrentCoords(data: ISSData | undefined) {
	if (!data) return [0, 0, 0];

	const { x, y, z } = getCoordsFromLatLng(
		data.latitude,
		(data.longitude * -1 + 180) % 360,
		getOrbitRadiusInPoints(data.altitude),
	);

	return [x, y, z];
}

export async function fetchIssData(): Promise<ISSData | undefined> {
	const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
	if (res.ok) {
		const data = (await res.json()) as ISSData;
		return data;
	}
}

export async function fetchAllLocations(excludedIds: string[]) {
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

export async function fetchCurrentForLocations(
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

export const getPercentOfDayElapsed = () => {
	return (
		((new Date().getUTCHours() + new Date().getUTCMinutes() / 60) / 24) % 24
	);
};

export function processObservationJSON(input: ObservationJSON): {
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

import chunk from 'lodash/chunk';
import padStart from 'lodash/padStart';

const padInput = (input: number, length = 2) =>
	padStart(String(input), length, '0');

function createUTCString(date: Date) {
	return `${padInput(date.getUTCFullYear(), 4)}${padInput(
		date.getUTCMonth() + 1,
	)}${padInput(date.getUTCDate())}T${padInput(date.getUTCHours())}${padInput(
		date.getUTCMinutes(),
	)}${padInput(date.getUTCSeconds())}Z`;
}

export const updateSatelliteData = async (
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
