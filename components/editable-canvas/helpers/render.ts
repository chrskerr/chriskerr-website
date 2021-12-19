
import { RowCol, Cell } from "types";
import range from "lodash/range";

import { cellWidth, rowGap, cellHeight } from "./index";

interface RendererProps {
	timestamp: number,
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D
	selectedTextStart: RowCol,
	selectedTextEnd: RowCol,
	dataRows: Cell[][],
	cursorRowCol: RowCol,
}

export const renderer = ({ 
	timestamp, 
	canvas, 
	ctx,
	dataRows,
	selectedTextStart,
	selectedTextEnd,
	cursorRowCol,
}: RendererProps ) => {
	if ( !canvas || !ctx ) return;

	ctx.clearRect( 0, 0, canvas.width, canvas.height );
	ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace";

	const isSelecting = ( selectedTextStart.row || selectedTextStart.col ) && ( selectedTextEnd.row || selectedTextEnd.col );

	if ( isSelecting ) {
		let highlightStart: RowCol, highlightEnd: RowCol;
		if ( selectedTextEnd.row > selectedTextStart.row  ) {
			highlightStart = selectedTextStart;
			highlightEnd = selectedTextEnd;
		} else if ( selectedTextEnd.row < selectedTextStart.row ) {
			highlightStart = selectedTextEnd;
			highlightEnd = selectedTextStart;
		} else {
			if ( selectedTextEnd.col > selectedTextStart.col ) {
				highlightStart = selectedTextStart;
				highlightEnd = selectedTextEnd;
			} else {
				highlightStart = selectedTextEnd;
				highlightEnd = selectedTextStart;
			}
		}

		const rowsToHighlight = range( highlightStart.row, highlightEnd.row + 1 );
		ctx.fillStyle = "#0077bd";
		
		rowsToHighlight.forEach(( row, i ) => {
			const dataRow = dataRows[ row ];
			if ( !dataRow ) return;

			const rowLength = dataRow.length;
			if ( rowLength === 0 ) return;
			
			const startingCell = Math.max( i === 0 ? highlightStart.col : 0, 0 );
			const endingCell = Math.min( i === rowsToHighlight.length - 1 ? highlightEnd.col : rowLength, rowLength );
			
			const start = ( startingCell + 1 ) * cellWidth;
			const width = ( endingCell - startingCell ) * cellWidth;
			
			ctx.fillRect(
				start,
				(( row + 1 ) * cellHeight ) - rowGap + ( row * rowGap ), 
				width,
				cellHeight + 6,
			);
		});

	}

	const displayCursor = Boolean( Math.floor( timestamp / 750 ) % 2 );
	const { row: cursorRow, col: cursorCol } = cursorRowCol;
	if ( !isSelecting && displayCursor ) {
		ctx.fillStyle = "#0077bd";
		const currRow = dataRows[ cursorRow ];
		const currRowLength = currRow?.filter(({ id }) => id !== "terminator" ).length || 0;

		const adjustedCursorCol = ( !currRow || currRowLength === 0 ) ?
			0 :
			Math.min( cursorCol, currRowLength );

		ctx.fillRect( 
			(( adjustedCursorCol + 1 ) * cellWidth ) - 3, 
			(( cursorRow + 1 ) * cellHeight ) - rowGap + ( cursorRow * rowGap ), 
			2, 
			cellHeight + 6, 
		);
	}
	
	ctx.fillStyle = "black";

	dataRows.forEach(( row, rowNum ) => {
		const rowPos = (( rowNum + 2 ) * cellHeight ) + (( rowNum - 1 ) * rowGap );
		row.forEach(( col, colNum ) => {
			if ( col.id === "terminator" ) return;
			ctx.fillText( 
				col.value, 
				( colNum + 1 ) * cellWidth, 
				rowPos,
				cellWidth,
			);
		});
	});
};
