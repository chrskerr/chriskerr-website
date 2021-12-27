import { Mesh, MeshStandardMaterial } from 'three';
import { useGLTF } from '@react-three/drei';

export type GLTF = ReturnType<typeof useGLTF> & {
	materials: Record<string, MeshStandardMaterial>;
	nodes: Record<string, Mesh>;
};

export type ISSData = {
	name: string;
	latitude: number;
	longitude: number;

	/**
	 * Altitude KM
	 */
	altitude: number;

	/**
	 * Velocity in KM / hour
	 */
	velocity: number;
};

export type AllObservationsJSON = {
	Id: string;
	Name: string;
	Resolution: number;
	StartTime: [string, string];
	EndTime: [string, string];
};

export type ObservationJSON = {
	Id: string;
	Coordinates: [
		string,
		[
			{
				Latitude: [string, [number, number]];
				Longitude: [string, [number, number]];
			},
		],
	];
	RadialLength: [string, [number, number]];
};

export type Coords = {
	id: string;
	x: number;
	y: number;
	z: number;
};
