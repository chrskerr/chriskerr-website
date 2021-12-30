import { useGLTF } from '@react-three/drei';
import { Coords, GLTF } from '../../types';
import { Box3, Vector3 } from 'three';
import { useEffect, useState } from 'react';

import { animated, useSpring } from '@react-spring/three';

import { getIssScaledLength } from '../../helpers';

const path = '/models/simple-satellite.glb';

export default function SimpleSatellite({ coords }: { coords: Coords }) {
	const model = useGLTF(path);
	const { nodes, materials } = model as GLTF;

	const [scale, setScale] = useState(0);

	useEffect(() => {
		const bb = new Box3();
		bb.setFromObject(model.scene);

		const length = bb.max.x - bb.min.x;
		const scaledLength = getIssScaledLength(length);

		setScale(scaledLength * 2_000);
	}, [model]);

	const vector = [coords.x, coords.y, coords.z];

	const { position } = useSpring({
		position: vector,
		config: { duration: 120_000 },
	});

	return (
		<animated.group
			dispose={null}
			position={position as unknown as Vector3}
			scale={scale}
		>
			<mesh
				geometry={nodes.badan_satelit.geometry}
				material={materials['Material.005']}
				position={[-0.01, 0.08, 0.19]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[1.48, 3.52, 1.44]}
			/>
			<mesh
				geometry={nodes.antena.geometry}
				material={materials['Material.001']}
				position={[-0.01, -2.77, -5.83]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[4.05, 2.08, 3.89]}
			/>
			<mesh
				geometry={nodes.pemancar_sinyal.geometry}
				material={materials['Material.028']}
				position={[-0.01, -3.11, -6.56]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.3, 0.33, 0.3]}
			/>
			<mesh
				geometry={nodes.batang_sinyal.geometry}
				material={materials['Material.023']}
				position={[-0.01, -2.19, -4.61]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.18, 1.96, 0.17]}
			/>
			<mesh
				geometry={nodes.Cylinder.geometry}
				material={materials['Material.012']}
				position={[1.38, -0.7, 1.44]}
				rotation={[-2.01, 1.08, 0]}
				scale={[0.18, 1.66, 0.2]}
			/>
			<mesh
				geometry={nodes.sayap.geometry}
				material={materials['Material.039']}
				position={[-3.87, 0.59, 1.26]}
				rotation={[2.7, Math.PI / 2, 0]}
				scale={[1, 0.03, 1.94]}
			/>
			<mesh
				geometry={nodes.Cube002.geometry}
				material={materials['Material.015']}
				position={[-5.8, 0.59, 1.27]}
				rotation={[2.7, -1.57, 0]}
				scale={[1, 0.03, 0.01]}
			/>
			<mesh
				geometry={nodes.Cube006.geometry}
				material={materials['Material.011']}
				position={[-5.61, 0.94, 2.01]}
				rotation={[2.7, -1.57, 0]}
				scale={[0.08, 0.03, 0.08]}
			/>
			<mesh
				geometry={nodes.Cylinder002.geometry}
				material={materials['Material.030']}
				position={[-0.02, -2.59, -6.73]}
				rotation={[3.12, 0, 0]}
				scale={[0.03, 0.39, 0.04]}
			/>
			<mesh
				geometry={nodes.Cylinder004.geometry}
				material={materials['Material.002']}
				position={[-0.01, 1.77, 3.91]}
				rotation={[-2.01, Math.PI / 2, 0]}
			/>
			<mesh
				geometry={nodes.Cylinder006.geometry}
				material={materials['Material.004']}
				position={[0.51, 1.48, 3.33]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.33, 0.36, 0.31]}
			/>
			<mesh
				geometry={nodes.Cylinder007.geometry}
				material={materials['Material.003']}
				position={[-0.53, 1.49, 3.33]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.33, 0.36, 0.31]}
			/>
			<mesh
				geometry={nodes.Cube004.geometry}
				material={materials['Material.010']}
				position={[-9.54, 0.94, 2.01]}
				rotation={[2.7, -1.57, 0]}
				scale={[0.08, 0.03, 0.08]}
			/>
			<mesh
				geometry={nodes.Cube007.geometry}
				material={materials['Material.009']}
				position={[-13.48, 0.94, 2.01]}
				rotation={[2.7, -1.57, 0]}
				scale={[0.08, 0.03, 0.08]}
			/>
			<mesh
				geometry={nodes.Cube008.geometry}
				material={materials['Material.033']}
				position={[-1.96, 0.39, 0.84]}
				rotation={[2.7, 0, 0]}
				scale={[0.27, 0.04, 0.1]}
			>
				<mesh
					geometry={nodes.Cylinder012.geometry}
					material={nodes.Cylinder012.material}
					position={[0.72, 0, 0]}
					scale={[0.13, 25.06, 0.37]}
				/>
				<mesh
					geometry={nodes.Cylinder013.geometry}
					material={nodes.Cylinder013.material}
					position={[-0.73, 0, 0]}
					scale={[0.13, 25.06, 0.37]}
				/>
				<mesh
					geometry={nodes.Cylinder015.geometry}
					material={materials['Material.036']}
					position={[0.72, 0.03, -10]}
					rotation={[0, 1.57, 0]}
					scale={[0.37, 1.16, 0.13]}
				/>
				<mesh
					geometry={nodes.Cylinder017.geometry}
					material={materials['Material.034']}
					position={[-0.73, 0.03, 0]}
					rotation={[0, 1.57, 0]}
					scale={[0.37, 1.16, 0.13]}
				/>
			</mesh>
			<mesh
				geometry={nodes.Cylinder018.geometry}
				material={materials['Material.024']}
				position={[-0.75, -1.48, -3.17]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.02, 0.77, 0.02]}
			/>
			<mesh
				geometry={nodes.Cylinder019.geometry}
				material={materials['Material.027']}
				position={[0.71, -1.48, -3.17]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.02, 0.77, 0.02]}
			/>
			<mesh
				geometry={nodes.Cylinder020.geometry}
				material={materials['Material.026']}
				position={[-0.01, -0.78, -3.51]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.02, 0.77, 0.02]}
			/>
			<mesh
				geometry={nodes.Cylinder021.geometry}
				material={materials['Material.025']}
				position={[-0.01, -2.23, -2.82]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.02, 0.77, 0.02]}
			/>
			<mesh
				geometry={nodes.Cylinder001.geometry}
				material={materials['Material.032']}
				position={[0.48, -3.08, -6.5]}
				rotation={[2.7, 0.42, Math.PI / 2]}
				scale={[0.03, 0.39, 0.04]}
			/>
			<mesh
				geometry={nodes.Cylinder003.geometry}
				material={materials['Material.031']}
				position={[0, -3.55, -6.28]}
				rotation={[2.28, 0, -Math.PI]}
				scale={[0.03, 0.39, 0.04]}
			/>
			<mesh
				geometry={nodes.Cylinder005.geometry}
				material={materials['Material.029']}
				position={[-0.51, -3.08, -6.5]}
				rotation={[2.7, -0.42, -Math.PI / 2]}
				scale={[0.03, 0.39, 0.04]}
			/>
			<mesh
				geometry={nodes.Cube001.geometry}
				material={materials['Material.014']}
				position={[-1.61, 0.61, 1.3]}
				rotation={[-2.01, Math.PI / 2, 0]}
				scale={[0.01, 0.71, 0.28]}
			/>
			<mesh
				geometry={nodes.Cube012.geometry}
				material={materials['Material.013']}
				position={[1.62, 0.61, 1.3]}
				rotation={[-2.01, -Math.PI / 2, 0]}
				scale={[0.01, 0.71, 0.28]}
			/>
			<mesh
				geometry={nodes.Cube011.geometry}
				material={materials['Material.016']}
				position={[5.81, 0.59, 1.27]}
				rotation={[-0.44, Math.PI / 2, 0]}
				scale={[1, 0.03, 0.01]}
			/>
			<mesh
				geometry={nodes.Cube010.geometry}
				material={materials['Material.007']}
				position={[9.55, 0.94, 2.01]}
				rotation={[-0.44, Math.PI / 2, 0]}
				scale={[0.08, 0.03, 0.08]}
			/>
			<mesh
				geometry={nodes.Cube009.geometry}
				material={materials['Material.006']}
				position={[5.62, 0.94, 2.01]}
				rotation={[-0.44, Math.PI / 2, 0]}
				scale={[0.08, 0.03, 0.08]}
			/>
			<mesh
				geometry={nodes.Cube005.geometry}
				material={materials['Material.008']}
				position={[13.5, 0.94, 2.01]}
				rotation={[-0.44, Math.PI / 2, 0]}
				scale={[0.08, 0.03, 0.08]}
			/>
			<mesh
				geometry={nodes.Cube003.geometry}
				material={materials['Material.017']}
				position={[1.97, 0.39, 0.84]}
				rotation={[2.7, 0, -Math.PI]}
				scale={[0.27, 0.04, 0.1]}
			>
				<mesh
					geometry={nodes.Cylinder026.geometry}
					material={nodes.Cylinder026.material}
					position={[-0.73, 0, 0]}
					scale={[0.13, 25.06, 0.37]}
				/>
				<mesh
					geometry={nodes.Cylinder027.geometry}
					material={nodes.Cylinder027.material}
					position={[0.72, 0, 0]}
					scale={[0.13, 25.06, 0.37]}
				/>
			</mesh>
			<mesh
				geometry={nodes.sayap001.geometry}
				material={materials['Material.018']}
				position={[3.89, 0.59, 1.26]}
				rotation={[-0.44, -1.57, 0]}
				scale={[1, 0.03, 1.94]}
			/>
			<mesh
				geometry={nodes.Cylinder031.geometry}
				material={materials['Material.019']}
				position={[10, 0.82, 1.76]}
				rotation={[2.7, Math.PI / 2, 0]}
				scale={[0.04, 0.05, 0.03]}
			/>
		</animated.group>
	);
}

useGLTF.preload(path);
