
import { getImage } from "./images";
import { getHeightFromTargetWidth, getRandomValue, getValueFromRange } from "./sizing";
import { Element } from "../types";
import { moveElement } from "./elements";
import { getProbability } from "./timing";
import { gameHeight } from "../constants";

type BirdFileNames = "hummingbird.svg"

async function createBird ( canvas: HTMLCanvasElement, name: BirdFileNames ): Promise<Element> {
	const img = await getImage( name );
	const width = 50;
	const height = getHeightFromTargetWidth( img, width );

	return {
		type: "bird",
		img,
		width,
		height,
		x: canvas.width,
		y: 200 - height,
		yVelocity: 0,
		xVelocity: -0.1,
	};
}

async function getBirdEl ( canvas: HTMLCanvasElement, name: BirdFileNames ) {
	const el = await createBird( canvas, name );

	return ( user?: Element ): Element => {
		const widthBase = ( user?.width || 150 ) * 0.8;
		const width = getValueFromRange( widthBase, widthBase / 2 );
		const height = getHeightFromTargetWidth( el.img, width );

		return {
			...el,
			y: getValueFromRange( gameHeight / 2, gameHeight / 2 ) + el.height,
			xVelocity: getValueFromRange( -0.3, 0.15 ),
			width, height,
		}; 
	};
}

export async function initBirds ( canvas: HTMLCanvasElement ) {
	const birdEls = [ 
		await getBirdEl( canvas, "hummingbird.svg" ),
	];

	let birds: ( Element | false )[] = [ getRandomValue( birdEls )() ];


	return ( timeStampGap: number, user: Element ): { birds: ( Element | false )[], extraPoints: number, dead: boolean } => {
		if ( getProbability( 1.75, timeStampGap )) {
			birds.push( getRandomValue( birdEls )( user ));
			birds = birds.filter( Boolean );
		} 

		const canvasWidth = canvas.width;
		
		let extraPoints = 0;
		let dead = false;

		const userLeft = user.x;
		const userRight = userLeft + user.width;
		const userBottom = user.y;
		const userTop = userBottom + user.height;

		birds = birds.map( bird =>  {
			if ( !bird ) return false;
			const updatedBird = moveElement( bird, timeStampGap, canvasWidth );

			if ( updatedBird.x + updatedBird.width < 0 ) return false;
			if ( bird.x > userRight ) return updatedBird;
			if ( bird.y > userTop ) return updatedBird;
			if ( bird.y + bird.height < userBottom ) return updatedBird;
			if ( bird.x + bird.width < userLeft ) return updatedBird;

			if ( bird.width > user.width ) {
				dead = true;

			} else {
				extraPoints ++;
				user.width += 5;
				user.height = getHeightFromTargetWidth( user.img, user.width );

			}

			return false;
		});

		return { birds, extraPoints, dead };
	};
}
