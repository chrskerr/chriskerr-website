import { ReactElement } from 'react';

import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';

const ISSRender = dynamic(() => import('components/iss'), {
	ssr: false,
	loading: () => <p className="font-mono text-2xl text-center">Loading</p>,
});

const title = "Where's the ISS?";

export default function ISS(): ReactElement {
	return (
		<>
			<NextSeo
				title={title}
				description="The ISS orbiting the Earth"
				canonical="https://www.chriskerr.com.au/iss"
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<p className="mb-4">
					The International Space station, plotted in near-realtime
					above the earth.
				</p>
				<p className="mb-4">
					It&apos;s not amazingly accurate... because the model of the
					earth isn&apos; very accurate, the orientation of the model
					versus lat and lng was my visual estimation, and the ISS had
					to be about 5000:1 scale, otherwise you&apos;d never see it!
				</p>
				<p className="mb-4">
					Still, it live updates with the latest location 😃
				</p>
			</div>
			<div className="flex flex-col flex-1 min-h-[1000px] display-width divider-before">
				<ISSRender />
			</div>
		</>
	);
}