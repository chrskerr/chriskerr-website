import { useEffect, useState } from 'react';
import { getCoordsFromLatLng } from './helpers';

const update = () =>
	getCoordsFromLatLng(0, getPercentOfDayElapsed() * 360, 150_000_000);

const getPercentOfDayElapsed = () => {
	return (
		((new Date().getUTCHours() + new Date().getUTCMinutes() / 60) / 24) % 24
	);
};

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
