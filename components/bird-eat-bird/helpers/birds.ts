
import { getImage } from "./images";
import { getHeightFromTargetWidth, getRandomValue, getValueFromRange } from "./sizing";
import { Element } from "types/bird-eat-bird";
import { moveElement } from "./elements";
import { getProbability } from "./timing";
import { gameHeight } from "../constants";

type BirdFileNames = "hummingbird.svg"

const initialWidth = 50;

async function createBird ( canvas: HTMLCanvasElement, name: BirdFileNames ): Promise<Element> {
	const img = await getImage( name );
	const width = initialWidth;
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
			xVelocity: getValueFromRange( -0.4, 0.1 ),
			width, height,
		}; 
	};
}

export async function initBirds ( canvas: HTMLCanvasElement ) {
	const birdEls = [ 
		await getBirdEl( canvas, "hummingbird.svg" ),
	];

	let birds: ( Element | false )[] = [ getRandomValue( birdEls )() ];


	return ( timeStampGap: number, user: Element, points: number, health: number ): { birds: ( Element | false )[], updatedPoints: number, updatedHealth: number } => {
		if ( getProbability( 1.5, timeStampGap )) {
			birds.push( getRandomValue( birdEls )( user ));
			birds = birds.filter( Boolean );
		} 

		const canvasWidth = canvas.width;
		
		let updatedHealth = health;
		let updatedPoints = points;

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
				updatedPoints = 0;
				updatedHealth -= 10;

			} else {
				updatedPoints ++;

				updatedHealth = Math.min( 30, updatedHealth + 1 );

			}

			user.width = initialWidth + updatedPoints * 5;
			user.height = getHeightFromTargetWidth( user.img, user.width );

			return false;
		});

		return { birds, updatedPoints, updatedHealth };
	};
}
