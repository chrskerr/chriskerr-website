import { ReactElement, Suspense } from 'react';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

import Earth from './earth';
import ISS from './iss';
import Sun from './sun';
import { getOrbitRadiusInPoints } from './helpers';
import { DoubleSide } from 'three';

const radius = getOrbitRadiusInPoints(0);

export default function ISSRender(): ReactElement {
	return (
		<Canvas className="flex-1 bg-gray-50">
			<OrbitControls
				target={[0, 0, 0]}
				dampingFactor={0.1}
				enableDamping
				minDistance={5.5}
				maxDistance={30}
				zoomSpeed={0.25}
				rotateSpeed={0.25}
				makeDefault
			/>
			<PerspectiveCamera makeDefault position={[0, 2, 15]} />

			<ambientLight intensity={0.05} />
			<Sun />

			<Suspense fallback={null}>
				<Earth />
				<ISS />
				<mesh rotation={[0.5 * Math.PI, 0, 0]}>
					<ringGeometry args={[radius, radius + 0.02, 50]} />
					<meshStandardMaterial color="black" side={DoubleSide} />
				</mesh>
			</Suspense>
		</Canvas>
	);
}
