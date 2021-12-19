
import { init } from "components/bird-eat-bird/helpers/init";
import { ElementIds } from "components/bird-eat-bird/types";
import { ReactElement, useRef, useEffect } from "react";

export default function BirdEatBird (): ReactElement {
	const ref = useRef<HTMLCanvasElement>( null );

	useEffect(() => {
		let cancel: (() => void ) | undefined = undefined;
		( async () => {
			cancel = await init({ ref });
		})();

		return () => {
			if ( cancel ) cancel();
		};
	}, []);

	return (
		<canvas ref={ ref } id={ ElementIds.CANVAS } className="w-auto h-auto mx-auto bg-gray-50" />
	);
}