
import { gameHeight } from "../constants";
import { Element } from "../types";

export function moveElement ( 
	element: Element, 
	timestampGap: number, 
	canvas: HTMLCanvasElement, 
	inputYVel?: number, 
	inputXVel?: number, 

): Element {
	let yVelocity = inputYVel || element.yVelocity;
	let y = element.y + ( yVelocity * timestampGap );

	if ( y + element.height > gameHeight ) {
		y = gameHeight - element.height;
		yVelocity = 0;
	}
	else if ( y < 0 ) {
		y = 0;
		yVelocity = 0;
	}

	let xVelocity = inputXVel || element.xVelocity;
	let x = element.x + ( xVelocity * timestampGap );

	if ( element.type === "user" ) {
		if ( x + element.width > canvas.width ) {
			x = canvas.width - element.width;
			xVelocity = 0;
		}
		else if ( x < 0 ) {
			x = 0;
			xVelocity = 0;
		}
	}
	
	return {
		...element,
		y,
		yVelocity,
		x, 
		xVelocity,
	};
}
