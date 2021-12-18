
export enum ElementIds {
	CANVAS = "canvas",
	FOOTER = "footer",
}

export type Element = {
	img: HTMLImageElement,
	width: number,
	height: number,
	x: number,
	y: number,
	yVelocity: number,
	xVelocity: number,
}