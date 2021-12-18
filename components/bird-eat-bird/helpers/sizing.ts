import { ElementIds } from "../types";

export function refitCanvasToScreen () {
	const canvas = document.getElementById( ElementIds.CANVAS ) as HTMLCanvasElement;
	const footer = document.getElementById( ElementIds.FOOTER ) as HTMLDivElement;

	if ( !canvas || !footer ) return;

	const parentEl = canvas.parentElement;

	const maxHeight = window.innerHeight - canvas.offsetTop - footer.offsetHeight;

	if ( parentEl ) {
		canvas.width = Math.min( parentEl.clientWidth, window.innerWidth );
		canvas.height = Math.min( parentEl.clientHeight, maxHeight );
	}
}
