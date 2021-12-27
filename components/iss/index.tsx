import { ReactElement, Suspense } from 'react';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

import Earth from './earth';
import ISS from './iss';
import Sun from './sun';
import Satellites from './satellites/index';

export default function ISSRender(): ReactElement {
	return (
		<Canvas className="flex-1 bg-gray-50">
			<OrbitControls
				target={[0, 0, 0]}
				dampingFactor={0.1}
				enableDamping
				minDistance={5.5}
				maxDistance={50}
				zoomSpeed={0.5}
				rotateSpeed={0.25}
				makeDefault
			/>
			<PerspectiveCamera makeDefault position={[0, 2, 15]} />

			<ambientLight intensity={0.05} />
			<Sun />

			<Satellites />

			<Suspense fallback={null}>
				<Earth />
				<ISS />
			</Suspense>
		</Canvas>
	);
}
