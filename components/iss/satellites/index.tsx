import { ReactElement, Suspense } from 'react';
import useAllSatellites from './use-all-satellites';

import Satellite from './satellite';

export default function Satellites(): ReactElement {
	const data = useAllSatellites();

	return (
		<Suspense fallback={null}>
			{data?.length &&
				data.map(coords => (
					<Satellite key={coords.id} coords={coords} />
				))}
		</Suspense>
	);
}
