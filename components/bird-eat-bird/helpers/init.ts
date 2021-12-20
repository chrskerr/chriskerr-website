
import { RefObject } from "react";
import { windowResize } from "./events";
import { getBackgroundSize, refitCanvasToScreen } from "./sizing";
import { gameHeight } from "../constants";
import { Element } from "../types";

import memoize from "lodash/memoize";
import throttle from "lodash/throttle";

interface InitProps {
	ref: RefObject<HTMLCanvasElement>,
}

import { getImage } from "./images";
import { getUser, moveUser } from "./user";
import { initClouds } from "./clouds";
import { getDefaultMousePos } from "../constants";
import { initBirds } from "./birds";

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
	const updateBirdsPromise = initBirds( canvas );

	const backgroundImg = await getImage( "background.svg" );
	const memoizedGetBackgroundSize = memoize( getBackgroundSize( backgroundImg ));

	const updateClouds = await updateCloudsPromise;
	const updateBirds = await updateBirdsPromise;
	
	let user = await userPromise;

	let { x: mouseX, y: mouseY } = getDefaultMousePos( canvas );
	let viewPortHeightOffset = 0;

	let lastTimestamp = 0;
	let avgGap = 0;
	let points = 0;
	let health = 3;

	let isRunning = true;

	const drawElement = ( el: Element | false ) => {
		if ( el ) ctx.drawImage( el.img, el.x, el.y - viewPortHeightOffset, el.width, el.height );
	};

	const render = ( timestamp: number ) => {
		if ( !canvas ) return;

		const timestampGap = timestamp - lastTimestamp;
		avgGap = (( timestampGap / 1000 ) + ( 99 * avgGap )) / 100;
		lastTimestamp = timestamp; 

		const backgroundSize = memoizedGetBackgroundSize( gameHeight );
		
		ctx.drawImage( backgroundImg, canvas.width - backgroundSize.width, -1 * viewPortHeightOffset, backgroundSize.width, gameHeight );

		updateClouds( timestampGap ).forEach( drawElement );
		const { birds, updatedPoints, updatedHealth } = updateBirds( timestampGap, user, points, health );
		points = updatedPoints;
		health = updatedHealth;

		birds.forEach( drawElement );

		const { updatedUser, updatedViewPortHeightOffset } = moveUser( user, mouseY, mouseX, timestampGap, canvas, viewPortHeightOffset );

		user = updatedUser;
		viewPortHeightOffset = updatedViewPortHeightOffset;

		drawElement( user );

		ctx.font = "30px 'Open Sans'";
		ctx.fillText(( 1 / avgGap ).toFixed( 1 ) + " FPS", canvas.width - 200, 50 );
		ctx.fillText( "Points: " + points, 50, 50 );
		ctx.fillText( "Health: " + health, 50, 100 );

		if ( isRunning ) requestAnimationFrame( render );
	};

	requestAnimationFrame( render );

	const onMouseMove = throttle(( e: MouseEvent ) => {
		mouseY = e.offsetY;
		mouseX = e.offsetX;
	}, 40 );

	canvas.addEventListener( "mousemove", onMouseMove, { passive: true });
	window.addEventListener( "resize", windowResize, { passive: true });

	return () => isRunning = false;
}
