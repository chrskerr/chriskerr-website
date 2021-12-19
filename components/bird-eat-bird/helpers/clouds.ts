
import { getImage } from "./images";
import { getHeightFromTargetWidth } from "./sizing";
import { Element } from "../types";
import { moveElement } from "./elements";
import { getProbability } from "./timing";

async function createCloud ( canvas: HTMLCanvasElement ): Promise<Element> {
	const img = await getImage( "cloud.svg" );
	const width = 150;
	const height = getHeightFromTargetWidth( img, width );

	return {
		type: "cloud",
		img,
		width,
		height,
		x: canvas.width,
		y: 200 - height,
		yVelocity: 0,
		xVelocity: -0.1,
	};
}

export async function initClouds ( canvas: HTMLCanvasElement ) {
	let clouds: Element[] = [ await createCloud( canvas ) ];

	const newCloud = await createCloud( canvas );

	return ( delta: number ): Element[] => {
		if ( getProbability( 3, delta )) {
			clouds.push({ ...newCloud });
		} 
		
		clouds = [ ...clouds ]
			.map( cloud =>  moveElement( cloud, delta, canvas ))
			.filter( cloud => cloud.x + cloud.width > 0 );


		return clouds;
	};
}