import { ReactElement, useState, lazy, Suspense } from 'react';

import { NextSeo } from 'next-seo';

const ISSRender = lazy(() => import('components/iss'));

const title = "Where's the ISS?";

export default function ISS(): ReactElement {
	const [isGrabbing, setIsGrabbing] = useState(false);

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
				<p className="mb-4">
					A random sample of SpaceX&apos;s Starlink satellites load in
					as well, many more and things tend to grind to a halt! These
					may not be particularly well mapped to this model of Earth,
					but they add some nice extra detail!
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
				<Suspense
					fallback={
						<p className="font-mono text-2xl text-center">
							Loading
						</p>
					}
				>
					<ISSRender />
				</Suspense>
			</div>
		</>
	);
}
