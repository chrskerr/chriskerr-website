import { Coords } from '../types';
import { Vector3, DoubleSide, Group } from 'three';
import { memo, useEffect, useRef } from 'react';

import { animated, useSpring } from '@react-spring/three';

const edgeLength = 0.01;
const dishRadius = edgeLength * 1.5;

const panelRotation: [number, number, number] = [0, -0.5 * Math.PI, 0];
const panelWidth = 1.5 * edgeLength;
const panelHeight = 2 * edgeLength;

const Satellite = memo(function Satellite({ coords }: { coords: Coords }) {
	const group = useRef<Group>();

	const vector = [coords.x, coords.y, coords.z];

	const { position } = useSpring({
		position: vector,
		config: { duration: 120_000 },
	});

	useEffect(() => {
		group.current?.lookAt(0, 0, 0);
		group.current?.rotateY(-0.5 * Math.PI);
	}, [coords]);

	return (
		<animated.group
			// @ts-ignore
			ref={group}
			dispose={null}
			position={position as unknown as Vector3}
		>
			<mesh>
				<boxGeometry args={[edgeLength, edgeLength, edgeLength]} />
				<meshPhongMaterial color="#d4d4d8" shininess={100} />
			</mesh>
			<mesh
				position={[dishRadius * 1.5, 0, 0]}
				rotation={[0, 0, 0.5 * Math.PI]}
			>
				<sphereGeometry
					args={[dishRadius, 8, 4, 0, 2 * Math.PI, 0, 1]}
				/>
				<meshPhongMaterial
					color="#d4d4d8"
					shininess={0}
					side={DoubleSide}
				/>
			</mesh>

			<mesh position={[0, 2 * edgeLength, 0]} rotation={panelRotation}>
				<planeGeometry args={[panelWidth, panelHeight]} />
				<meshPhongMaterial color="#d4d4d8" shininess={100} />
			</mesh>
			<mesh
				position={[(-1 * edgeLength) / 100, 2 * edgeLength, 0]}
				rotation={panelRotation}
			>
				<planeGeometry args={[0.85 * panelWidth, 0.85 * panelHeight]} />
				<meshPhongMaterial color="#02588a" shininess={100} />
			</mesh>

			<mesh position={[0, -2 * edgeLength, 0]} rotation={panelRotation}>
				<planeGeometry args={[panelWidth, panelHeight]} />
				<meshPhongMaterial color="#d4d4d8" shininess={100} />
			</mesh>
			<mesh
				position={[(-1 * edgeLength) / 100, -2 * edgeLength, 0]}
				rotation={panelRotation}
			>
				<planeGeometry args={[0.85 * panelWidth, 0.85 * panelHeight]} />
				<meshPhongMaterial color="#02588a" shininess={100} />
			</mesh>

			<mesh position={[0, 0, 0]}>
				<cylinderGeometry
					args={[edgeLength / 20, edgeLength / 20, 2 * edgeLength]}
				/>
				<meshPhongMaterial color="#d4d4d8" shininess={100} />
			</mesh>
		</animated.group>
	);
});

export default Satellite;
