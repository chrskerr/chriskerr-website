import type { GLTF } from './types';

import { useGLTF } from '@react-three/drei';

const path = '/models/earth.glb';

export default function Model() {
	const model = useGLTF(path);
	const { nodes, materials } = model as GLTF;

	return (
		<group dispose={null}>
			<group position={[0, 0, 0]} rotation={[0.15, -0.5 * Math.PI, -0.1]}>
				<mesh
					geometry={nodes.Icosphere001_1.geometry}
					material={materials['water.001']}
				/>
				<mesh
					geometry={nodes.Icosphere001_2.geometry}
					material={materials['land.001']}
				/>
			</group>
		</group>
	);
}

useGLTF.preload(path);
