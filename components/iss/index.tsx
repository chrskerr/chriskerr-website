import { ReactElement, Suspense } from 'react';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

import Earth from './earth';
import ISS from './generic-satellite';
import Sun from './sun';
import { getOrbitRadiusInPoints } from './helpers';
import { DoubleSide } from 'three';

const radius = getOrbitRadiusInPoints(0);

export default function ISSRender(): ReactElement {
	return (
		<Suspense fallback={null}>
			<Canvas className="flex-1 bg-gray-50">
				<OrbitControls target={[0, 0, 0]} />
				<PerspectiveCamera makeDefault position={[0, 2, 15]} />
				<ambientLight intensity={0.05} />
				<Earth />
				<ISS />
				<Sun />
				<mesh rotation={[0.5 * Math.PI, 0, 0]}>
					<ringGeometry args={[radius, radius + 0.02, 50]} />
					<meshStandardMaterial color="black" side={DoubleSide} />
				</mesh>
			</Canvas>
		</Suspense>
	);
}
