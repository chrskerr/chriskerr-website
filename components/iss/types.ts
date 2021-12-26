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

	/**
	 * Timestamp of receipt of last date update
	 */
	timestamp: number;
};
