
import { ElementIds } from "components/bird-eat-bird/types";
import useBirdEatBird from "components/bird-eat-bird/use-bird-eat-bird";
import { ReactElement, useRef } from "react";

export default function BirdEatBird (): ReactElement {
	const $_ref = useRef<HTMLCanvasElement>( null );

	const something = useBirdEatBird({ ref: $_ref });

	return (
		<canvas ref={ $_ref } id={ ElementIds.CANVAS } className="min-w-full min-h-full bg-blue-200" />
	);
}