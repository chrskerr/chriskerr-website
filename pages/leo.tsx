import { ReactElement, useState } from 'react';

import { NextSeo } from 'next-seo';

import dynamic from 'next/dynamic';
const ISSRender = dynamic(() => import('components/iss'), {
	ssr: false,
	loading: () => <p className="font-mono text-2xl text-center">Loading</p>,
});
const title = 'Low Earth Orbit';

export default function ISS(): ReactElement {
	const [isGrabbing, setIsGrabbing] = useState(false);

	return (
		<>
			<NextSeo
				title={title}
				description="Low Earth Orbit"
				canonical="https://www.chriskerr.dev/leo"
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<p className="mb-4">
					The International Space station, available NASA satellites,
					and as many as possible of SpaceX&apos;s satellites plotted
					in near-realtime above the Earth.
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
				<p className="mb-4">
					There are many many more unacccounted for satellites, but
					the browser can only handle so much.
				</p>
			</div>
			<div
				className={`relative flex flex-col flex-1 min-h-[400px] sm:min-h-[1000px] display-width divider-before ${
					isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
				}`}
				onMouseDown={() => setIsGrabbing(true)}
				onMouseUp={() => setIsGrabbing(false)}
				onMouseOut={() => setIsGrabbing(false)}
			>
				<ISSRender />
			</div>
		</>
	);
}
