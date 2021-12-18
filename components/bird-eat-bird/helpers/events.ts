
import throttle from "lodash/throttle";
import { refitCanvasToScreen } from "./sizing";

export const windowResize = throttle(() => {
	refitCanvasToScreen();
}, 20 );
