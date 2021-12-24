import { NextSeo } from 'next-seo';
import { init } from 'components/bird-eat-bird/helpers/init';
import { ElementIds } from 'types/bird-eat-bird';
import { ReactElement, useRef, useEffect } from 'react';

export default function BirdEatBird(): ReactElement {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		let cancel: (() => void) | undefined = undefined;
		(async () => {
			cancel = await init({ ref });
		})();

		return () => {
			if (cancel) cancel();
		};
	}, []);

	return (
		<>
			<NextSeo
				title="Bird Eat Bird"
				description="A browser game where you attempt to eat as many others birds as you can, before getting eaten yourself!"
				canonical="https://www.chriskerr.com.au/bird-eat-bird"
			/>
			<canvas
				ref={ref}
				id={ElementIds.CANVAS}
				className="w-auto h-auto mx-auto bg-gray-50"
			/>
		</>
	);
}
