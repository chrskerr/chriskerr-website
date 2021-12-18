
import { init } from "components/bird-eat-bird/helpers/init";
import { ElementIds } from "components/bird-eat-bird/types";
import { ReactElement, useRef, useEffect } from "react";

export default function BirdEatBird (): ReactElement {
	const ref = useRef<HTMLCanvasElement>( null );

	useEffect(() => {
		let reference: number | undefined = undefined;
		( async () => {
			reference = await init({ ref });
		})();

		return () => {
			if ( reference ) cancelAnimationFrame( reference );
		};
	}, []);

	return (
		<canvas ref={ ref } id={ ElementIds.CANVAS } className="min-w-full min-h-full bg-gray-50" />
	);
}