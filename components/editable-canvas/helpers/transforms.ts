import { nanoid } from "nanoid";
import { EditableCanvasChangeEvent, Cell } from "types";


export const createInsertEvent = ( insert_before: string, cells: Cell[], sessionId: string ): EditableCanvasChangeEvent => {
	return {
		change : {
			up: { type: "insert", insert_before, cells },
			down: { type: "delete", cells },
		},
		sessionId,
		id: nanoid(),
	};
};
	
export const createDeleteEvent = ( insert_before: string, cells: Cell[], sessionId: string ): EditableCanvasChangeEvent => {
	return {
		change: {
			up: { type: "delete", cells },
			down: { type: "insert", insert_before, cells },
		},
		sessionId,
		id: nanoid(),
	};
};