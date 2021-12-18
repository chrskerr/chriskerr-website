import { RefObject, useEffect } from "react";
import { init } from "./helpers/init";

interface UseBirdEatBirdProps {
	ref: RefObject<HTMLCanvasElement>,
}

export default function useBirdEatBird ({ ref }: UseBirdEatBirdProps ) {

	useEffect(() => {
		init({ ref })
	}, [])

}
