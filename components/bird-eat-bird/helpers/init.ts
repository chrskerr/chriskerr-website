import { RefObject } from "react";
import { windowResize } from "./events";
import { refitCanvasToScreen } from "./sizing";

interface InitProps {
	ref: RefObject<HTMLCanvasElement>,
}

export async function init ({ ref }: InitProps ) {
	let canvas = ref.current;

	while ( !canvas ) {
		await new Promise( resolve => setTimeout( resolve, 10 ));
		canvas = ref.current;
	}

	refitCanvasToScreen();

	const ctx = canvas.getContext( "2d" );



	console.log( canvas );

	window.addEventListener( "resize", windowResize, { passive: true });

}
