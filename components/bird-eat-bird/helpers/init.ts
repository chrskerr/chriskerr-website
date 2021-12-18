
import { RefObject } from "react";
import { windowResize } from "./events";
import { getBackgroundSize, refitCanvasToScreen } from "./sizing";
import { createGetFractionOfSecond } from "./timing";

import memoize from "lodash/memoize";
import throttle from "lodash/throttle";

interface InitProps {
	ref: RefObject<HTMLCanvasElement>,
}

import { getImage } from "./images";
import { getUser, moveUser } from "./elements";

export async function init ({ ref }: InitProps ) {
	let canvas = ref.current;

	while ( !canvas ) {
		await new Promise( resolve => setTimeout( resolve, 10 ));
		canvas = ref.current;
	}

	refitCanvasToScreen();

	const ctx = canvas.getContext( "2d" );

	if ( !ctx ) return;

	const getFractionOfSecond = createGetFractionOfSecond();

	const backgroundImg = await getImage( "background.svg" );
	const memoizedGetBackgroundSize = memoize( getBackgroundSize( backgroundImg ));

	let user = await getUser( canvas );
	let mouseY = canvas.height / 2;

	let lastTimestamp = 0;
	let avgGap = 0;

	const render = ( timestamp: number ) => {
		if ( !canvas ) return;

		avgGap = ((( timestamp - lastTimestamp ) / 1000 ) + ( 99 * avgGap )) / 100;
		lastTimestamp = timestamp; 

		const fractionOfSecond = getFractionOfSecond( timestamp );

		const backgroundSize = memoizedGetBackgroundSize( canvas.width, canvas.height );
		
		ctx.drawImage( backgroundImg, 0, 0, backgroundSize.width, backgroundSize.height );

		user = moveUser( user, mouseY, fractionOfSecond, canvas );
		ctx.drawImage( user.img, user.x, user.y, user.width, user.height );

		ctx.font = "30px 'Open Sans'";
		ctx.fillText(( 1 / avgGap ).toFixed( 1 ) + " FPS", canvas.width - 200, 50 );

		requestAnimationFrame( render );
	};

	const reference = requestAnimationFrame( render );

	const onMouseMove = throttle(( e: MouseEvent ) => {
		if ( e.type === "mouseout" ) {
			setTimeout(() => {
				if ( !canvas ) return;
				mouseY = canvas.height / 2;
			}, 100 );
		}
		else mouseY = e.offsetY;
	}, 25 );

	canvas.addEventListener( "mousemove", onMouseMove, { passive: true });
	canvas.addEventListener( "mouseout", onMouseMove, { passive: true });
	window.addEventListener( "resize", windowResize, { passive: true });

	return reference;
}
