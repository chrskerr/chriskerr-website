import { nanoid } from 'nanoid';
import { EditableCanvasChangeEvent, Cell } from 'types/editor';

export const createInsertEvent = (
	insert_before: string,
	cells: Cell[],
): EditableCanvasChangeEvent => {
	return {
		change: {
			up: { type: 'insert', insert_before, cells },
			down: { type: 'delete', cells },
		},
		id: nanoid(),
	};
};

export const createDeleteEvent = (
	insert_before: string,
	cells: Cell[],
): EditableCanvasChangeEvent => {
	return {
		change: {
			up: { type: 'delete', cells },
			down: { type: 'insert', insert_before, cells },
		},
		id: nanoid(),
	};
};

export const convertCellsToString = (cells: Cell[]) => {
	return cells.map(cell => cell.value).join('');
};
