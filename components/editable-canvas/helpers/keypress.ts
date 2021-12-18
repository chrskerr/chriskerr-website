import { Cell, EditableCanvasChangeEvent, EditableCanvasData, RowCol } from "types";
import { getTargetCell, invertChange, processChangeEvent, processDelete, processInsert } from ".";
import { createDeleteEvent, createInsertEvent } from "./transforms";

export const processInsertEvent = ( 
	char: string, 
	cursorRowCol: RowCol, 
	data: EditableCanvasData, 
	dataRows: Cell[][],
	sessionId: string,

): { result: EditableCanvasData, event: EditableCanvasChangeEvent } => {
	const targetCell = getTargetCell( cursorRowCol, dataRows );
	const targetId = targetCell?.id || "terminator";

	const { result, newCells } = processInsert({ 
		data, 
		targetId, 
		char, 
	});

	return {
		result,
		event: createInsertEvent( targetId, newCells, sessionId ),
	};
};

export const processDeleteEvent = ( 
	cursorRowCol: RowCol, 
	data: EditableCanvasData, 
	dataRows: Cell[][],
	sessionId: string,

): { result: EditableCanvasData, event: EditableCanvasChangeEvent } => {
	const targetCell = getTargetCell( cursorRowCol, dataRows );
	const targetId = targetCell?.id || "terminator";

	const { result, deletedCells } = processDelete({
		data,
		targetId,
		count: 1,
	}); 

	return {
		result,
		event: createDeleteEvent( targetId, deletedCells, sessionId ),
	};
};

interface ProcessUndo {
	history: EditableCanvasChangeEvent[],
	undoStack: EditableCanvasChangeEvent[],
	data: EditableCanvasData,
}

export const processUndo = ({ history, undoStack, data }: ProcessUndo ) => {
	const updatedHistory = [ ...history ];
	const latestChange = updatedHistory.pop();

	if ( !latestChange ) return;

	const invertedChange = invertChange( latestChange );

	const updatedData = processChangeEvent( data, invertedChange );

	return {
		event: invertedChange,
		updatedData,
		updatedHistory,
		updatedUndoStack: [ ...undoStack, invertedChange ],
	};
};

interface ProcessRedo {
	history: EditableCanvasChangeEvent[],
	undoStack: EditableCanvasChangeEvent[],
	data: EditableCanvasData,
}

export const processRedo = ({ history, undoStack, data }: ProcessRedo ) => {
	const updatedUndoStack = [ ...undoStack ];
	const latestUndo = updatedUndoStack.pop();

	if ( !latestUndo ) return;

	const invertedUndo = invertChange( latestUndo );

	const updatedData = processChangeEvent( data, invertedUndo );

	return {
		event: invertedUndo,
		updatedData,
		updatedHistory: [ ...history, invertedUndo ],
		updatedUndoStack,
	};
};