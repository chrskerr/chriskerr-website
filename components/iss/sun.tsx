import { useEffect, useState } from 'react';
import { getCoordsFromLatLng, getPercentOfDayElapsed } from './helpers';

const update = () =>
	getCoordsFromLatLng(0, getPercentOfDayElapsed() * 360, 150_000_000);

export default function Sun() {
	const [coords, setCoords] = useState(update());

	useEffect(() => {
		const interval = setInterval(() => {
			setCoords(update());
		}, 60_000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return <pointLight position={[coords.x, coords.y, coords.z]} />;
}
