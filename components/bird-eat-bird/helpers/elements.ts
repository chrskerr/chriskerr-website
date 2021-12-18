import { Element } from "../types";
import { getImage } from "./images";
import { getHeightFromTargetWidth } from "./sizing";

export async function getUser ( canvas: HTMLCanvasElement ): Promise<Element> {
	const img = await getImage( "bald_eagle.svg" );
	const width = 150;
	const height = getHeightFromTargetWidth( img, width );

	return {
		img,
		width,
		height,
		x: 150,
		y: ( canvas.height / 2 ) - ( height / 2 ),
		yVelocity: 0,
		xVelocity: 0,
	};
}

const damping = 0.98;

export function moveUser ( user: Element, mouseY: number, fractionOfSecond: number, canvas: HTMLCanvasElement ): Element {
	const distanceFromUser = mouseY - user.y - ( user.height / 2 );

	const yVelocityChange = distanceFromUser * 5 * fractionOfSecond;
	let yVelocity = ( user.yVelocity + yVelocityChange ) * damping;
	let y = user.y + ( yVelocity * fractionOfSecond );

	if ( y + user.height > canvas.height ) {
		y = canvas.height - user.height;
		yVelocity = 0;
	}
	else if ( y < 0 ) {
		y = 0;
		yVelocity = 0;
	}
	
	return {
		...user,
		y,
		yVelocity,
	};
}
