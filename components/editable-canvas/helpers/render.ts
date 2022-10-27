import { RowCol, Cell } from 'types/editor';
import range from 'lodash/range';

import { cellWidth, rowGap, cellHeight } from './index';
import { sortSelectedTextPositions } from './cursor';

interface RendererProps {
	timestamp: number;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	selectedTextStart: RowCol | undefined;
	selectedTextEnd: RowCol | undefined;
	dataRows: Cell[][];
	cursorRowCol: RowCol;
	isFocussed: boolean;
}

export const renderer = ({
	timestamp,
	canvas,
	ctx,
	dataRows,
	selectedTextStart,
	selectedTextEnd,
	cursorRowCol,
	isFocussed,
}: RendererProps) => {
	if (!canvas || !ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "400 16px 'IBM Plex Mono'";

	const isSelecting = selectedTextStart && selectedTextEnd;

	if (isSelecting) {
		const [highlightStart, highlightEnd] = sortSelectedTextPositions(
			selectedTextStart,
			selectedTextEnd,
		);

		const rowsToHighlight = range(highlightStart.row, highlightEnd.row + 1);
		ctx.fillStyle = '#0077bd';

		rowsToHighlight.forEach((row, i) => {
			const dataRow = dataRows[row];
			if (!dataRow) return;

			const rowLength = dataRow.length;
			if (rowLength === 0) return;

			const startingCell = Math.max(i === 0 ? highlightStart.col : 0, 0);
			const endingCell = Math.min(
				i === rowsToHighlight.length - 1 ? highlightEnd.col : rowLength,
				rowLength,
			);

			const start = (startingCell + 1) * cellWidth;
			const width = (endingCell - startingCell) * cellWidth;

			ctx.fillRect(
				start,
				(row + 1) * cellHeight - rowGap + row * rowGap,
				width,
				cellHeight + 6,
			);
		});
	}

	const displayCursor =
		isFocussed && Boolean(Math.floor(timestamp / 750) % 2);
	const { row: cursorRow, col: cursorCol } = cursorRowCol;

	if (!isSelecting && displayCursor) {
		ctx.fillStyle = '#0077bd';
		ctx.fillRect(
			(cursorCol + 1) * cellWidth - 3,
			(cursorRow + 1) * cellHeight - rowGap + cursorRow * rowGap,
			2,
			cellHeight + 6,
		);
	}

	ctx.fillStyle = 'black';

	dataRows.forEach((row, rowNum) => {
		const rowPos = (rowNum + 2) * cellHeight + (rowNum - 1) * rowGap;
		row.forEach((col, colNum) => {
			if (col.id === 'terminator') return;
			ctx.fillText(
				col.value,
				(colNum + 1) * cellWidth,
				rowPos,
				cellWidth,
			);
		});
	});
};
