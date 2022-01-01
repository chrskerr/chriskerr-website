import { ChangeEvent, ReactElement, Suspense, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

import Earth from './earth';
import ISS from './iss';
import Sun from './sun';
import Satellites from './satellites/index';

export default function ISSRender(): ReactElement {
	const [context, setContext] = useState({
		totalSatellites: 150,
		displayedSatellites: 150,
	});

	const updateDisplayedSatellites = (e: ChangeEvent<HTMLInputElement>) => {
		const value = Math.max(
			Math.min(
				Math.floor(Number(e.target.value)),
				context.totalSatellites,
			),
			0,
		);
		setContext(c => ({ ...c, displayedSatellites: value }));
	};

	return (
		<>
			<label className="absolute z-50 py-1 pl-3 pr-1 bg-white border rounded border-opacity-80 top-4 right-14">
				Number of SpaceX Satellites to display
				<input
					type="number"
					className="ml-4"
					value={context.displayedSatellites}
					min={0}
					max={context.totalSatellites}
					onChange={updateDisplayedSatellites}
				/>
			</label>
			<Canvas className="flex-1 w-full bg-gray-50 ">
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

				<Satellites
					setTotalSatellites={(value: number) =>
						setContext(c => ({ ...c, totalSatellites: value }))
					}
					displayedSatellites={context.displayedSatellites}
				/>

				<Suspense fallback={null}>
					<Earth />
					<ISS />
				</Suspense>
			</Canvas>
		</>
	);
}
