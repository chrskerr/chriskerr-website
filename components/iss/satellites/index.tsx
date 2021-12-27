import { ReactElement, Suspense } from 'react';

import Satellite from './satellite';
import useSpaceXData from './use-spacex-data';

export default function Satellites(): ReactElement {
	const data = useSpaceXData();

	return (
		<Suspense fallback={null}>
			{data?.length &&
				data.map(coords => (
					<Satellite key={coords.id} coords={coords} />
				))}
		</Suspense>
	);
}
