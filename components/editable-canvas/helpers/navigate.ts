
import type { CursorPos, Directions, EditableCanvasData, RowCol } from "types/editor";
import { splitDataIntoRows } from ".";
import { getCursorPosFromRowCol, getRowColForCursorPos  } from "./cursor";

interface NavigateProps {
	dir: Directions,
	data: EditableCanvasData,
	ref: HTMLCanvasElement,
	cursorPos: CursorPos,
	retainedCol: number,
}

interface NavigatePropsReturn {
	newCursorPos: CursorPos,
	newRowCol: RowCol,
	newRetainedCol: number,
}

export const navigate = ({ dir, data, ref, cursorPos, retainedCol }: NavigateProps ): NavigatePropsReturn => {
	const dataAsRows = splitDataIntoRows( data, ref );
	const newRowCol = getRowColForCursorPos( cursorPos, dataAsRows );

	newRowCol.col = retainedCol > newRowCol.col ? retainedCol : newRowCol.col;

	let newRetainedCol = retainedCol;

	let currIndex = data.cells.findIndex(({ id }) => id === cursorPos );
	if ( currIndex === -1 ) currIndex = data.cells.length;

	if ( dir === "up" && newRowCol.row > 0 ) {
		const newRow = dataAsRows[  -- newRowCol.row ];
		if ( newRowCol.col > newRow.length - 1 ) newRowCol.col = newRow.length - 1;

	} else if ( dir === "down" &&  newRowCol.row < dataAsRows.length - 1 ) {
		const newRow = dataAsRows[  ++ newRowCol.row ];
		if ( newRowCol.col > newRow.length - 1 ) newRowCol.col = newRow.length - 1;

	} else if ( dir === "right" || dir === "left" ) {
		const newCell = dir === "right" ? 
			data.cells[ currIndex + 1 ] : 
			data.cells[ currIndex - 1 ] || data.cells[ 0 ];
				
		const newCellId = newCell?.id || "terminator";
		newRetainedCol = getRowColForCursorPos( newCellId, dataAsRows ).col;

		return {
			newRetainedCol,
			newCursorPos: newCellId,
			newRowCol: getRowColForCursorPos( newCellId, dataAsRows ),
		};
	}

	return {
		newRetainedCol,
		newCursorPos: getCursorPosFromRowCol( newRowCol, dataAsRows ),
		newRowCol,
	};
};