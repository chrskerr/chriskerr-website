import { maxGameWidth } from "../constants";
import { ElementIds } from "../types";

export function refitCanvasToScreen () {
	const canvas = document.getElementById( ElementIds.CANVAS ) as HTMLCanvasElement;
	const footer = document.getElementById( ElementIds.FOOTER ) as HTMLDivElement;

	if ( !canvas || !footer ) return;

	const parentEl = canvas.parentElement;

	const maxHeight = window.innerHeight - canvas.offsetTop - footer.offsetHeight;

	if ( parentEl ) {
		canvas.width = Math.min( Math.min( parentEl.clientWidth, window.innerWidth, maxGameWidth ));
		canvas.height = Math.min( parentEl.clientHeight, maxHeight );
	}
}

export function getBackgroundSize ( img: HTMLImageElement ) {
	return ( canvasHeight: number ) => {
		return {
			width: img.width * canvasHeight / img.height,
			height: canvasHeight,
		};
	};
}

export const getHeightFromTargetWidth = ( el: HTMLImageElement, targetWidth: number ) => {
	return el.height * targetWidth / el.width;
};

export const getValueFromRange = ( median: number, range: number ) => {
	return median + (( Math.random() * range * 2 ) - range );
};

export function getRandomValue<T>( range: T[]): T {
	return range[ Math.floor( Math.random() * range.length ) ];
}
