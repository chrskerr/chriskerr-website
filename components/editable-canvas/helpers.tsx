
import { nanoid } from "nanoid";
import type { RefObject } from "react";
import type { EditableCanvasData, Cell, CursorPos, RowCol, CellId, EditableCanvasChangeEvent } from "types";

export const cellWidth = 14;
export const cellHeight = 16;
export const rowGap = 8;

export const splitDataIntoRows = ( data: EditableCanvasData, ref: RefObject<HTMLCanvasElement> ): Cell[][] => {
	const width = ref.current?.width;
	if ( !width ) return [];

	const availableWidth = width - ( 2 * cellWidth );
	const availableCols = availableWidth / cellWidth;

	const rows = data.cells.reduce<Cell[][]>(( acc, cell ) => {
		const currentRowIndex = acc.length - 1;
		const currentRow = acc[ currentRowIndex ];

		if ( cell.value === "\n" ) {
			acc[ currentRowIndex ].push( cell );
			return [ ...acc, []];
		}

		if ( currentRow.length >= availableCols  ) {
			return [
				...acc,
				[ cell ],
			];

		} 

		acc[ currentRowIndex ].push( cell );
		return acc;

	}, [[]]);

	rows[ rows.length - 1 ].push({ id: "terminator", value: "$" });

	return rows;
};

export const getRowColForCursorPos = ( cursorPos: CursorPos, data: Cell[][]): RowCol => {
	for ( let i = 0; i < data.length; i ++ ) {
		const row = data[ i ];
		for ( let j = 0; j < row.length; j ++ ) {
			const cell = row[ j ];
			if ( cell.id === cursorPos ) return { row: i, col: j };
		}
	}
	return { row: 0, col: 0 };
};

export const getCursorPosFromRowCol = ( rowCol: RowCol, dataAsRows: Cell[][]): CursorPos => {
	const row = dataAsRows[ rowCol.row ];
	const cell = row ? row[ rowCol.col ] : undefined;
	return cell?.id || "terminator";
};



// sizing helpers 
export const getParentInnerWidth = ( el: HTMLElement | null ) => {
	if ( !el || !el.parentElement ) return;
	return el.parentElement.clientWidth - Number( getComputedStyle( el.parentElement ).paddingLeft.replace( "px", "" )) * 2;
};



// onKeypress helpers
export const getTargetCell = ( cursorPos: RowCol, dataAsRows: Cell[][]): Cell | undefined => {
	const targetRow = dataAsRows[ cursorPos.row ];
	return targetRow ? 
		targetRow[ cursorPos.col ] :		
		undefined;
};

export const getCurrentIndex = ( targetId: CellId, data: EditableCanvasData ) => {
	return targetId === "terminator" ? data.cells.length : data.cells.findIndex(({ id }) => id === targetId );
};



// mouse helpers
export const getRowColAtMousePos = ( e: MouseEvent ): RowCol => {
	return {
		row: Math.max( 0, Math.floor((( e.offsetY + rowGap )/ ( cellHeight + rowGap )) - 1 )),
		col: Math.max( 0, Math.floor(( e.offsetX / cellWidth ) - 1 )),
	};
};


// processing 

const createNewCell = ( char: string ): Cell => ({ id: nanoid(), value: char === "Enter" ? "\n" : char });

interface ProcessInsertProps {
	data: EditableCanvasData,
	targetId: string,
	char: string | string[] | Cell[],
}

interface ProcessInsertResult {
	result: EditableCanvasData,
	newCells: Cell[],
}

export const processInsert = ({ data, targetId, char }: ProcessInsertProps ): ProcessInsertResult => {
	const currIndex = getCurrentIndex( targetId, data );
	const newCells: Cell[] = typeof char === "string" ? 
		[ createNewCell( char ) ] :
		char.map( c => typeof c === "string" ? createNewCell( c ) : c );

	const result = { ...data };

	if ( currIndex <= 0 ) {
		result.cells = [ ...newCells, ...data.cells ];
	} else {
		result.cells.splice( currIndex, 0, ...newCells );
	}

	return { result, newCells };
};

interface ProcessDeleteProps {
	data: EditableCanvasData,
	cells?: Cell[],
	targetId?: string,
	count?: number,
}

interface ProcessDeleteCellsProps extends ProcessDeleteProps {
	cells: Cell[],
	targetId?: undefined,
	count?: undefined,
}

interface ProcessDeleteTargetProps extends ProcessDeleteProps {
	cells?: undefined,
	targetId: string,
	count: number,
}

interface ProcessDeleteResult {
	result: EditableCanvasData,
	deletedCells: Cell[],
}

export function processDelete ({ data, cells, targetId, count }: ProcessDeleteCellsProps ): ProcessDeleteResult
export function processDelete ({ data, cells, targetId, count }: ProcessDeleteTargetProps ): ProcessDeleteResult
export function processDelete ({ data, cells, targetId, count }: ProcessDeleteProps ): ProcessDeleteResult {
	if ( cells ) {
		const deletedIds = cells?.map(({ id }) => id );
	
		const deletedCells = data.cells.filter(({ id }) => deletedIds.includes( id ));
		const retainedCells = data.cells.filter(({ id }) => !deletedIds.includes( id ));

		return { 
			result: {
				...data,
				cells: retainedCells,
			},
			deletedCells,
		};
	} else if ( targetId && count ) {
		const dataCopy = { ...data };

		const currIndex = Math.max( getCurrentIndex( targetId, dataCopy ) - 1, 0 );
		const deletedCells = dataCopy.cells.splice( currIndex, count );

		return {
			result: dataCopy,
			deletedCells,
		};

	} else {
		return {
			result: data,
			deletedCells: [],
		};

	}
}

export const processChangeEvent = ( data: EditableCanvasData, event: EditableCanvasChangeEvent ): EditableCanvasData => {
	const action = event?.change?.up;

	if ( action.type === "insert" ) {
		return processInsert({ data, targetId: action.insert_before, char: action.cells }).result;
	}
	else if ( action.type === "delete" ) {
		return processDelete({ data, cells: action.cells }).result;
	}

	return data;
};

export const xor = ( a: boolean, b: boolean ) => ( a || b ) && !( a && b );

export const invertChange = ( input: EditableCanvasChangeEvent ): EditableCanvasChangeEvent => {
	return {
		...input,
		change: {
			up: input.change.down,
			down: input.change.up,
		},
	} as EditableCanvasChangeEvent;
};
