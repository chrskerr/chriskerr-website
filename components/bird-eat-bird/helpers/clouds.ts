
import { getImage } from "./images";
import { getHeightFromTargetWidth, getRandomValue, getValueFromRange } from "./sizing";
import { Element } from "../types";
import { moveElement } from "./elements";
import { getProbability } from "./timing";
import { gameHeight } from "../constants";

type CloudFileNames = "cloud.svg" | "cloud_2.svg" | "cloud_3.svg"

async function createCloud ( canvas: HTMLCanvasElement, name: CloudFileNames ): Promise<Element> {
	const img = await getImage( name );
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

async function getCloudEl ( canvas: HTMLCanvasElement, name: CloudFileNames ) {
	const el = await createCloud( canvas, name );

	return (): Element => ({
		...el,
		y: getValueFromRange( gameHeight * 0.35 - el.height, gameHeight * 0.3 ),
		xVelocity: getValueFromRange( -0.1, 0.05 ),
	});
}

export async function initClouds ( canvas: HTMLCanvasElement ) {
	const cloudEls = [ 
		await getCloudEl( canvas, "cloud.svg" ),
		await getCloudEl( canvas, "cloud_2.svg" ),
		await getCloudEl( canvas, "cloud_3.svg" ),
	];

	let clouds: ( Element | false )[] = [ getRandomValue( cloudEls )() ];

	return ( timeStampGap: number ): ( Element | false )[] => {
		if ( getProbability( 2, timeStampGap )) {
			clouds.push( getRandomValue( cloudEls )());
			clouds = clouds.filter( Boolean );
		} 

		const canvasWidth = canvas.width;
		
		clouds = clouds.map( cloud =>  {
			if ( !cloud ) return false;
			const updatedCloud = moveElement( cloud, timeStampGap, canvasWidth );
			return cloud.x + cloud.width > 0 ? updatedCloud : false;
		});

		return clouds;
	};
}