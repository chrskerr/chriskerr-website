import { ReactElement, Suspense } from 'react';

import Satellite from './satellite';
import useNasaData from './use-nasa-data';
import useSpaceXData from './use-spacex-data';

type Props = {
	setTotalSatellites: (value: number) => void;
	displayedSatellites: number;
};

export default function Satellites(props: Props): ReactElement {
	const spaceXData = useSpaceXData(props);
	const nasaData = useNasaData();

	const data = [...(spaceXData || []), ...(nasaData || [])];

	return (
		<Suspense fallback={null}>
			{data?.length &&
				data.map(coords => (
					<Satellite key={coords.id} coords={coords} />
				))}
		</Suspense>
	);
}
