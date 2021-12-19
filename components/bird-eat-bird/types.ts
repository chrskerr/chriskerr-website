
export enum ElementIds {
	CANVAS = "canvas",
	FOOTER = "footer",
}

export type ElementTypes = "user" | "cloud";

export type Element = {
	type: ElementTypes,
	img: HTMLImageElement,
	width: number,
	height: number,
	x: number,
	y: number,
	yVelocity: number,
	xVelocity: number,
}