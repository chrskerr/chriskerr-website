import clamp from 'lodash/clamp';
import { RowCol, CursorPos, Cell } from 'types/editor';
import { rowGap, cellHeight, cellWidth } from '.';

export const getRowColForCursorPos = (
	cursorPos: CursorPos,
	data: Cell[][],
): RowCol => {
	if (cursorPos === 'terminator') {
		return {
			row: data.length - 1 || 0,
			col: data[data.length - 1]?.length - 1 || 0,
		};
	}
	for (let i = 0; i < data.length; i++) {
		const row = data[i];
		for (let j = 0; j < row.length; j++) {
			const cell = row[j];
			if (cell.id === cursorPos) return { row: i, col: j };
		}
	}
	return { row: 0, col: 0 };
};

export const getCursorPosFromRowCol = (
	rowCol: RowCol,
	dataAsRows: Cell[][],
): CursorPos => {
	const row = dataAsRows[rowCol.row];
	const cell = row ? row[rowCol.col] : undefined;
	return cell?.id || 'terminator';
};

export const getCursorPosAtMousePos = (
	e: MouseEvent,
	dataAsRows: Cell[][],
): CursorPos => {
	const row = clamp(
		Math.floor((e.offsetY + rowGap) / (cellHeight + rowGap) - 1),
		0,
		dataAsRows.length - 1,
	);
	const col = clamp(
		Math.floor(e.offsetX / cellWidth - 1),
		0,
		dataAsRows[row].length - 1,
	);

	const rowCells = dataAsRows[row];
	const cell = rowCells && rowCells[col];
	return cell?.id || 'terminator';
};

export function sortSelectedTextPositions(
	selectedTextStart: RowCol,
	selectedTextEnd: RowCol,
) {
	let highlightStart: RowCol, highlightEnd: RowCol;
	if (selectedTextEnd.row > selectedTextStart.row) {
		highlightStart = selectedTextStart;
		highlightEnd = selectedTextEnd;
	} else if (selectedTextEnd.row < selectedTextStart.row) {
		highlightStart = selectedTextEnd;
		highlightEnd = selectedTextStart;
	} else {
		if (selectedTextEnd.col > selectedTextStart.col) {
			highlightStart = selectedTextStart;
			highlightEnd = selectedTextEnd;
		} else {
			highlightStart = selectedTextEnd;
			highlightEnd = selectedTextStart;
		}
	}

	return [highlightStart, highlightEnd];
}
