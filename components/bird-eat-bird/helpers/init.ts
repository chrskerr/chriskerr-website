
import { RefObject } from "react";
import { windowResize } from "./events";
import { getBackgroundSize, refitCanvasToScreen } from "./sizing";

import memoize from "lodash/memoize";
import throttle from "lodash/throttle";

interface InitProps {
	ref: RefObject<HTMLCanvasElement>,
}

import { getImage } from "./images";
import { getUser, moveUser } from "./user";
import { initClouds } from "./clouds";
import { getDefaultMousePos } from "../constants";

export async function init ({ ref }: InitProps ) {
	let canvas = ref.current;

	while ( !canvas ) {
		await new Promise( resolve => setTimeout( resolve, 10 ));
		canvas = ref.current;
	}

	refitCanvasToScreen();

	const ctx = canvas.getContext( "2d" );

	if ( !ctx ) return;

	const userPromise = getUser( canvas );
	const updateCloudsPromise = initClouds( canvas );

	const backgroundImg = await getImage( "background.svg" );
	const memoizedGetBackgroundSize = memoize( getBackgroundSize( backgroundImg ));

	const updateClouds = await updateCloudsPromise;
	
	let user = await userPromise;

	let { x: mouseX, y: mouseY } = getDefaultMousePos( canvas );

	let lastTimestamp = 0;
	let avgGap = 0;

	let isRunning = true;

	const render = ( timestamp: number ) => {
		if ( !canvas ) return;

		const timestampGap = timestamp - lastTimestamp;
		avgGap = (( timestampGap / 1000 ) + ( 99 * avgGap )) / 100;
		lastTimestamp = timestamp; 

		const backgroundSize = memoizedGetBackgroundSize( canvas.width, canvas.height );
		
		ctx.drawImage( backgroundImg, 0, 0, backgroundSize.width, backgroundSize.height );

		const clouds = updateClouds( timestampGap );
		clouds.forEach( cloud => {
			ctx.drawImage( cloud.img, cloud.x, cloud.y, cloud.width, cloud.height );
		});

		user = moveUser( user, mouseY, mouseX, timestampGap, canvas );
		ctx.drawImage( user.img, user.x, user.y, user.width, user.height );

		ctx.font = "30px 'Open Sans'";
		ctx.fillText(( 1 / avgGap ).toFixed( 1 ) + " FPS", canvas.width - 200, 50 );

		if ( isRunning ) requestAnimationFrame( render );
	};

	requestAnimationFrame( render );

	const onMouseMove = throttle(( e: MouseEvent ) => {
		if ( e.type === "mouseout" ) {
			setTimeout(() => {
				if ( !canvas ) return;
				const { x, y } = getDefaultMousePos( canvas );
				mouseY = y;
				mouseX = x;
			}, 100 );
		}
		else {
			mouseY = e.offsetY;
			mouseX = e.offsetX;
		}
	}, 25 );

	canvas.addEventListener( "mousemove", onMouseMove, { passive: true });
	canvas.addEventListener( "mouseout", onMouseMove, { passive: true });
	window.addEventListener( "resize", windowResize, { passive: true });

	return () => isRunning = false;
}
