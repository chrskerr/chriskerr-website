
import { Cell, CursorPos, EditableCanvasChangeEvent, EditableCanvasData, RowCol } from "types";
import { getTargetCell, invertChange, processChangeEvent, processDelete, processInsert } from ".";
import { getCursorPosFromRowCol } from "./cursor";
import { convertCellsToString, createDeleteEvent, createInsertEvent } from "./transforms";

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

interface ProcessDeleteMany {
	data: EditableCanvasData,
	dataAsRows: Cell[][],
	selectedTextStart: RowCol,
	selectedTextEnd: RowCol,
	sessionId: string,
	copyToClipboard?: boolean,
}

interface ProcessDeleteManyReturn {
	updatedData: EditableCanvasData,
	event: EditableCanvasChangeEvent,
	updatedCursorPos: CursorPos,
}

export const processDeleteMany = ({ 
	data, 
	dataAsRows, 
	selectedTextStart,
	selectedTextEnd, 
	sessionId,
	copyToClipboard,

}: ProcessDeleteMany ): ProcessDeleteManyReturn | null => {
	const updatedData = { ...data, cells: [ ...data.cells ]};

	const startCursorPos = getCursorPosFromRowCol( selectedTextStart, dataAsRows );
	const endCursorPos = getCursorPosFromRowCol( selectedTextEnd, dataAsRows );

	const [ startIndex, endIndex ] = [ 
		data.cells.findIndex(({ id }) => id === startCursorPos ),
		data.cells.findIndex(({ id }) => id === endCursorPos ),
	].sort(( a, b ) => a - b );

	let adjustedEndIndex = endIndex;
	if ( data.cells[ endIndex ]?.id === "terminator" ) adjustedEndIndex --;

	const updatedCursorPos = data.cells[ adjustedEndIndex ].id;

	if ( startIndex === undefined || endIndex === undefined || !updatedCursorPos ) return null;

	const deletedCells = updatedData.cells.splice( startIndex, adjustedEndIndex - startIndex );

	const event = createDeleteEvent( updatedCursorPos, deletedCells, sessionId );

	if ( copyToClipboard ) {
		navigator.clipboard.writeText( convertCellsToString( deletedCells ));
	}

	return {
		updatedData,
		event,
		updatedCursorPos,
	};
};

interface ProcessPaste {
	data: EditableCanvasData,
	pastedString: string,
	cursorPos: CursorPos,
	sessionId: string,
}

interface ProcessPasteReturn {
	updatedData: EditableCanvasData,
	event: EditableCanvasChangeEvent,
}

export const processPaste = ({
	data,
	pastedString,
	cursorPos,
	sessionId,
}: ProcessPaste ): ProcessPasteReturn | null => {
	const individualCharacters = pastedString
		.split( "" )
		.map(( char, i, array ) => {
			if ( char === "/" && array[ i + 1 ] === "n" ) return "Enter";
			else if ( char === "n" && array[ i - 1 ] === "Enter" ) return undefined;
			return char;
		})
		.filter( Boolean ) as string[];

	const { result, newCells } = processInsert({ data, targetId: cursorPos, char: individualCharacters });

	const event = createInsertEvent( cursorPos, newCells, sessionId );

	return {
		updatedData: result,
		event,
	};
};
