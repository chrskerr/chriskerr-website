import { useGLTF } from '@react-three/drei';
import { Coords, GLTF } from '../types';
import { Box3, Vector3 } from 'three';
import { useEffect, useState } from 'react';

import { animated, useSpring } from '@react-spring/three';

import { getIssScaledLength } from '../helpers';

const path = '/models/satellite.glb';

export default function Satellite({ coords }: { coords: Coords }) {
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
		config: { duration: 60_000 },
	});

	return (
		<animated.group
			dispose={null}
			position={position as unknown as Vector3}
			scale={scale}
		>
			<group position={[0, 3.34, -2.09]}>
				<mesh
					geometry={nodes.HoneyComb.geometry}
					material={nodes.HoneyComb.material}
				/>
				<mesh
					geometry={nodes.HoneyComb_1.geometry}
					material={nodes.HoneyComb_1.material}
				/>
				<mesh
					geometry={nodes.HoneyComb_2.geometry}
					material={materials['Material.002']}
				/>
			</group>
			<group position={[1.68, 4.52, 0.37]} rotation={[0, 0, 0.38]}>
				<mesh
					geometry={nodes.Cube009.geometry}
					material={nodes.Cube009.material}
				/>
				<mesh
					geometry={nodes.Cube009_1.geometry}
					material={nodes.Cube009_1.material}
				/>
				<group position={[5.07, 0, 0]} rotation={[0, 0, -0.75]}>
					<mesh
						geometry={nodes.Cube010.geometry}
						material={nodes.Cube010.material}
					/>
					<mesh
						geometry={nodes.Cube010_1.geometry}
						material={nodes.Cube010_1.material}
					/>
				</group>
			</group>
			<group
				position={[-1.67, 4.52, 0.37]}
				rotation={[0, 0, -0.38]}
				scale={[-1, 1, 1]}
			>
				<mesh
					geometry={nodes.Cube011.geometry}
					material={nodes.Cube011.material}
				/>
				<mesh
					geometry={nodes.Cube011_1.geometry}
					material={nodes.Cube011_1.material}
				/>
				<group position={[5.07, 0, 0]} rotation={[0, 0, -0.75]}>
					<mesh
						geometry={nodes.Cube012.geometry}
						material={nodes.Cube012.material}
					/>
					<mesh
						geometry={nodes.Cube012_1.geometry}
						material={nodes.Cube012_1.material}
					/>
				</group>
			</group>
			<group
				position={[0, 4.57, -4.09]}
				rotation={[-Math.PI, 0, -Math.PI]}
			>
				<mesh
					geometry={nodes.Cylinder006.geometry}
					material={nodes.Cylinder006.material}
				/>
				<mesh
					geometry={nodes.Cylinder006_1.geometry}
					material={materials['Material.006']}
				/>
			</group>
			<mesh
				geometry={nodes.Cylinder001.geometry}
				material={nodes.Cylinder001.material}
				position={[0, 3.82, 3.43]}
				rotation={[Math.PI / 2, 0, 0]}
				scale={[0.75, 0.61, 0.75]}
			/>
			<mesh
				geometry={nodes.Cylinder002.geometry}
				material={nodes.Cylinder002.material}
				position={[0, 3.96, 3.43]}
				rotation={[Math.PI / 2, 0, 0]}
				scale={[0.75, 0.46, 0.75]}
			/>
			<mesh
				geometry={nodes.Cube005.geometry}
				material={nodes.Cube005.material}
				position={[0, 3.55, 3.47]}
				rotation={[0, Math.PI / 2, 0]}
			/>
			<mesh
				geometry={nodes.Cube006.geometry}
				material={nodes.Cube006.material}
				position={[0, 4.15, 3.47]}
				rotation={[0, Math.PI / 2, 0]}
				scale={0.67}
			/>
			<mesh
				geometry={nodes.Cube007.geometry}
				material={nodes.Cube007.material}
				position={[0.28, 3.83, 3.51]}
				rotation={[0, -Math.PI / 2, 0]}
				scale={[0.52, 1, 1]}
			/>
			<mesh
				geometry={nodes.Cube008.geometry}
				material={nodes.Cube008.material}
				position={[-0.25, 3.83, 3.51]}
				rotation={[0, -Math.PI / 2, 0]}
				scale={[0.52, 1, 1]}
			/>
		</animated.group>
	);
}

useGLTF.preload(path);
