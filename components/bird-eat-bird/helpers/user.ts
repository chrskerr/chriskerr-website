import { getDefaultMousePos } from "../constants";
import { Element } from "../types";
import { moveElement } from "./elements";
import { getImage } from "./images";
import { getHeightFromTargetWidth } from "./sizing";

export async function getUser ( canvas: HTMLCanvasElement ): Promise<Element> {
	const img = await getImage( "bald_eagle.svg" );
	const width = 150;
	const height = getHeightFromTargetWidth( img, width );

	const { x, y } = getDefaultMousePos( canvas );

	return {
		type: "user",
		img,
		width,
		height,
		x,
		y: y - ( height / 2 ),
		yVelocity: 0,
		xVelocity: 0,
	};
}

const damping = 0.95;

export function moveUser ( 
	user: Element, 
	mouseY: number, 
	mouseX: number, 
	timestampGap: number, 
	canvas: HTMLCanvasElement,

): Element {
	const yDistanceFromUser = mouseY - user.y - ( user.height / 2 );
	const yVelocityChange = yDistanceFromUser / 50_000 * timestampGap;
	const yVelocity = ( user.yVelocity + yVelocityChange ) * damping;

	return moveElement( user, timestampGap, canvas, yVelocity, 0 );
}
