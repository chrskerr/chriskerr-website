import { ReactElement, Suspense } from 'react';

import Satellite from './simple-satellite';
import useSpaceXData from './use-spacex-data';

type Props = {
	setTotalSatellites: (value: number) => void;
	displayedSatellites: number;
};

export default function Satellites(props: Props): ReactElement {
	const data = useSpaceXData(props);

	return (
		<Suspense fallback={null}>
			{data?.length &&
				data.map(coords => (
					<Satellite key={coords.id} coords={coords} />
				))}
		</Suspense>
	);
}
