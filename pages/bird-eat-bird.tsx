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
				canonical={`${process.env.NEXT_PUBLIC_URL_BASE}/bird-eat-bird`}
			/>
			<div className="display-width">
				<h2 className="text-3xl">Bird Eat Bird</h2>
				<h3 className="mb-4 text-xl">A work in progress</h3>
				<p className="mb-4">
					I&apos;ve never tried to make a game before, so this is a
					start which my partner and I played around with.
				</p>
				<p className="mb-4">
					The eagle follows your mouse (sorry mobile users) and you
					gain points for eating (colliding) with smaller birds than
					you. You lose health by being eaten by a larger bird.
				</p>
			</div>
			<div className="display-width divider-before" />
			<canvas
				ref={ref}
				id={ElementIds.CANVAS}
				className="w-auto h-auto mx-auto bg-gray-50"
			/>
		</>
	);
}
