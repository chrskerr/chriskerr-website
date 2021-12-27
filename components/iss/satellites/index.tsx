import { ReactElement, Suspense } from 'react';
import useNasaData from './use-nasa-data';

import Satellite from './satellite';
import useSpaceXData from './use-spacex-data';
import { Coords } from '../types';

export default function Satellites(): ReactElement {
	// const data = useNasaData();

	const data2 = useSpaceXData();

	const data: Coords[] = [];

	return (
		<Suspense fallback={null}>
			{data?.length &&
				data.map(coords => (
					<Satellite key={coords.id} coords={coords} />
				))}
		</Suspense>
	);
}
