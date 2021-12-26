import { ISSData } from './types';

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
	47;

	return [x, y, z];
}

export async function fetchIssData(): Promise<ISSData | undefined> {
	const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
	if (res.ok) {
		const data = (await res.json()) as ISSData;
		if (data) {
			return {
				...data,
				timestamp: new Date().valueOf(),
			};
		}
	}
}

export const getPercentOfDayElapsed = () => {
	return (
		((new Date().getUTCHours() + new Date().getUTCMinutes() / 60) / 24) % 24
	);
};
