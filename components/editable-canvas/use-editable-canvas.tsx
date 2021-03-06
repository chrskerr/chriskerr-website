import throttle from 'lodash/throttle';

import { nanoid } from 'nanoid';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
	cellHeight,
	rowGap,
	splitDataIntoRows,
	getParentInnerWidth,
	xor,
	processAllChanges,
} from './helpers';

import {
	getRowColForCursorPos,
	getCursorPosAtMousePos,
} from './helpers/cursor';

import type {
	UseEditableCanvasProps,
	CursorPos,
	RowCol,
	EditableCanvasChangeEvent,
	Directions,
	EditableCanvasData,
	StoredChanges,
} from 'types/editor';

import serialize from 'async-function-serializer';
import { navigate } from './helpers/navigate';
import { renderer } from './helpers/render';
import {
	processDeleteEvent,
	processDeleteMany,
	processInsertEvent,
	processRedo,
	processUndo,
	processPaste,
} from './helpers/data';
import { convertCellsToString } from './helpers/transforms';

const useEditableCanvas = ({
	ref,
	cachedData,
	onDataChange,
	onEvent,
}: UseEditableCanvasProps) => {
	const history = useRef<EditableCanvasChangeEvent[]>([]);
	const undoStack = useRef<EditableCanvasChangeEvent[]>([]);

	const [data, setData] = useState(cachedData);
	const dataRef = useRef(data);

	const [dataRows, setDataRows] = useState(
		ref.current ? splitDataIntoRows(data, ref.current) : [],
	);
	const dataAsRowsRef = useRef(dataRows);

	const [focus, setFocus] = useState(false);
	const focusRef = useRef(focus);

	const [cursorPos, setCursorPos] = useState<CursorPos>('terminator');
	const cursorPosRef = useRef<CursorPos>(cursorPos);
	const cursorRowCol = useRef<RowCol>(
		getRowColForCursorPos(cursorPos, dataAsRowsRef.current),
	);
	const retainedCol = useRef(0);

	const immediatelyUpdateData = (data: EditableCanvasData) => {
		if (!ref.current) return;

		setData(data);
		dataRef.current = data;

		const dataRows = splitDataIntoRows(data, ref.current);
		setDataRows(dataRows);
		dataAsRowsRef.current = dataRows;
	};

	const immediatelyUpdateCursorPos = (pos?: CursorPos) => {
		if (
			!pos ||
			!dataRef.current.cells.some(
				({ id }) => id === pos || pos === 'terminator',
			)
		)
			return;
		setCursorPos(pos);
		cursorPosRef.current = pos;
		cursorRowCol.current = getRowColForCursorPos(
			pos,
			dataAsRowsRef.current,
		);
	};

	const processChange = useMemo(
		() =>
			serialize((event: StoredChanges) => {
				const updatedData = processAllChanges([event], dataRef.current);
				setData(updatedData);
			}),
		[],
	);

	const addToHistory = (item: EditableCanvasChangeEvent) => {
		history.current = [...history.current, item];
	};

	const doNavigate = (dir: Directions) => {
		if (!ref.current) return;

		const { newCursorPos, newRetainedCol, newRowCol } = navigate({
			dir,
			data: dataRef.current,
			ref: ref.current,
			cursorPos: cursorPosRef.current,
			retainedCol: retainedCol.current,
		});

		retainedCol.current = newRetainedCol;
		setCursorPos(newCursorPos);
		cursorRowCol.current = newRowCol;
	};

	useEffect(() => {
		if (!data) setData({ id: nanoid(), cells: [] });
		else {
			if (!ref.current) return;
			const newDataRows = splitDataIntoRows(data, ref.current);
			dataAsRowsRef.current = newDataRows;
			setDataRows(newDataRows);
			dataRef.current = data;
			onDataChange(data);
		}
	}, [data]);

	useEffect(() => {
		cursorPosRef.current = cursorPos;
		cursorRowCol.current = getRowColForCursorPos(cursorPos, dataRows);
	}, [cursorPos, dataRows]);

	useEffect(() => {
		focusRef.current = focus;
	}, [focus]);

	useEffect(() => {
		let isMouseDown = false;
		let selectedTextStart: RowCol | undefined = undefined;
		let selectedTextEnd: RowCol | undefined = undefined;

		let isRunning = true;

		const onResize = throttle(() => {
			if (!ref.current) return;

			const canvas = ref.current;
			canvas.width = getParentInnerWidth(canvas) || canvas.width;

			const newDataRows = splitDataIntoRows(data, ref.current);
			dataAsRowsRef.current = newDataRows;
			setDataRows(newDataRows);
		}, 20);

		const onFocusIn = () => {
			setFocus(true);
		};

		const onFocusOut = () => {
			setFocus(false);
		};

		const onClick = (e: MouseEvent) => {
			const updatedCursorPos = getCursorPosAtMousePos(
				e,
				dataAsRowsRef.current,
			);
			immediatelyUpdateCursorPos(updatedCursorPos);
		};

		const onMouseStart = () => {
			isMouseDown = true;
			selectedTextStart = undefined;
			selectedTextEnd = undefined;
		};

		const onMouseMove = throttle((e: MouseEvent) => {
			if (!isMouseDown) return;
			if (!selectedTextStart)
				selectedTextStart = getRowColForCursorPos(
					getCursorPosAtMousePos(e, dataAsRowsRef.current),
					dataAsRowsRef.current,
				);
			selectedTextEnd = getRowColForCursorPos(
				getCursorPosAtMousePos(e, dataAsRowsRef.current),
				dataAsRowsRef.current,
			);
		}, 20);

		const onMouseUp = () => {
			isMouseDown = false;
		};

		const processInsertDelete = (char: string) => {
			if (char.length > 1 && char !== 'Enter' && char !== 'Backspace')
				return;

			if (selectedTextStart && selectedTextEnd) {
				const cutCopyResults = processDeleteMany({
					data: dataRef.current,
					dataAsRows: dataAsRowsRef.current,
					selectedTextStart,
					selectedTextEnd,
				});
				if (cutCopyResults) {
					const { updatedData, event, updatedCursorPos } =
						cutCopyResults;
					immediatelyUpdateData(updatedData);
					immediatelyUpdateCursorPos(updatedCursorPos);
					addToHistory(event);
					onEvent(event);
				}
			}

			if (selectedTextStart && selectedTextEnd && char === 'Backspace')
				return;

			const { result, event } =
				char === 'Backspace'
					? processDeleteEvent(
							cursorRowCol.current,
							dataRef.current,
							dataAsRowsRef.current,
					  )
					: processInsertEvent(
							char,
							cursorRowCol.current,
							dataRef.current,
							dataAsRowsRef.current,
					  );

			immediatelyUpdateData(result);
			addToHistory(event);
			onEvent(event);

			undoStack.current = [];
		};

		const onUndoRedo = async (mode: 'undo' | 'redo') => {
			const result =
				mode === 'undo'
					? processUndo({
							history: history.current,
							undoStack: undoStack.current,
							data: dataRef.current,
					  })
					: processRedo({
							history: history.current,
							undoStack: undoStack.current,
							data: dataRef.current,
					  });
			if (!result) return;

			history.current = result.updatedHistory;
			undoStack.current = result.updatedUndoStack;

			onEvent(result.event);
			immediatelyUpdateData(result.updatedData);
		};

		const onCutCopy = (mode: 'cut' | 'copy') => {
			if (!selectedTextStart || !selectedTextEnd) return;
			const deleteManyResult = processDeleteMany({
				data: dataRef.current,
				dataAsRows: dataAsRowsRef.current,
				selectedTextStart,
				selectedTextEnd,
				copyToClipboard: true,
			});

			if (deleteManyResult && mode === 'cut') {
				const { updatedData, event, updatedCursorPos } =
					deleteManyResult;
				immediatelyUpdateData(updatedData);
				immediatelyUpdateCursorPos(updatedCursorPos);
				addToHistory(event);
				onEvent(event);
			}
		};

		const onPaste = async () => {
			const pastedString = await navigator.clipboard.readText();
			if (!pastedString || typeof pastedString !== 'string') return;

			if (selectedTextStart && selectedTextEnd) {
				const cutCopyResults = processDeleteMany({
					data: dataRef.current,
					dataAsRows: dataAsRowsRef.current,
					selectedTextStart,
					selectedTextEnd,
				});
				if (cutCopyResults) {
					const { updatedData, event, updatedCursorPos } =
						cutCopyResults;
					immediatelyUpdateData(updatedData);
					immediatelyUpdateCursorPos(updatedCursorPos);
					addToHistory(event);
					onEvent(event);
				}
			}

			const pasteResults = processPaste({
				data: dataRef.current,
				pastedString,
				cursorPos: cursorPosRef.current,
			});
			if (pasteResults) {
				const { updatedData, event } = pasteResults;
				immediatelyUpdateData(updatedData);
				addToHistory(event);
				onEvent(event);
			}
		};

		const onKeypress = (e: KeyboardEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const { key, metaKey, ctrlKey, altKey } = e;

			if (['Shift', 'CapsLock', 'Escape'].includes(key) || altKey) {
				// do nothing;
			} else if (key === 'ArrowRight') doNavigate('right');
			else if (key === 'ArrowLeft') doNavigate('left');
			else if (key === 'ArrowUp') doNavigate('up');
			else if (key === 'ArrowDown') doNavigate('down');
			else if (key === 'z' && xor(ctrlKey, metaKey)) onUndoRedo('undo');
			else if (key === 'y' && xor(ctrlKey, metaKey)) onUndoRedo('redo');
			else if (key === 'x' && xor(ctrlKey, metaKey)) onCutCopy('cut');
			else if (key === 'c' && xor(ctrlKey, metaKey)) onCutCopy('copy');
			else if (key === 'v' && xor(ctrlKey, metaKey)) onPaste();
			else if (key === 'Enter') processInsertDelete('Enter');
			else if (key === 'Backspace') processInsertDelete('Backspace');
			else processInsertDelete(key);

			if (key !== 'Control' && key !== 'Meta') {
				selectedTextStart = undefined;
				selectedTextEnd = undefined;
			}
		};

		(async () => {
			let canvas = ref.current;
			while (!canvas) {
				await new Promise(res => setImmediate(res));
				canvas = ref.current;
			}
			const ctx = canvas.getContext('2d');
			canvas.setAttribute('tabIndex', '1');
			canvas.style.cursor = 'text';

			if (!canvas) return;
			canvas.width = getParentInnerWidth(canvas) || canvas.width;

			dataAsRowsRef.current = splitDataIntoRows(data, canvas);

			if (!ctx) return;

			const render = (timestamp: number) => {
				if (!canvas) return;
				renderer({
					timestamp,
					dataRows: dataAsRowsRef.current,
					canvas,
					ctx,
					cursorRowCol: cursorRowCol.current,
					selectedTextEnd,
					selectedTextStart,
					isFocussed: focusRef.current,
				});
				if (isRunning) requestAnimationFrame(render);
			};

			requestAnimationFrame(render);

			canvas.addEventListener('keypress', onKeypress);
			canvas.addEventListener('focusin', onFocusIn, { passive: true });
			window.addEventListener('blur', onFocusOut, { passive: true });
			canvas.addEventListener('focusout', onFocusOut, { passive: true });
			canvas.parentElement?.addEventListener('click', onFocusIn, {
				passive: true,
			});
			canvas.addEventListener('click', onClick, { passive: true });
			canvas.addEventListener('mousedown', onMouseStart, {
				passive: true,
			});
			canvas.addEventListener('mousemove', onMouseMove, {
				passive: true,
			});
			canvas.addEventListener('mouseup', onMouseUp, { passive: true });
			canvas.addEventListener('mouseout', onMouseUp, { passive: true });
			window.addEventListener('resize', onResize, { passive: true });

			canvas.focus();
		})();

		return () => {
			ref.current?.removeEventListener('keypress', onKeypress);
			ref.current?.removeEventListener('focusin', onFocusIn);
			window.removeEventListener('blur', onFocusOut);
			ref.current?.removeEventListener('focusout', onFocusOut);
			ref.current?.parentElement?.removeEventListener('click', onFocusIn);
			ref.current?.removeEventListener('click', onClick);
			ref.current?.removeEventListener('mousedown', onMouseStart);
			ref.current?.removeEventListener('mousemove', onMouseMove);
			ref.current?.removeEventListener('mouseup', onMouseUp);
			ref.current?.removeEventListener('mouseout', onMouseUp);
			window.removeEventListener('resize', onResize);

			isRunning = false;
		};
	}, []);

	const [markdown, setMarkdown] = useState(
		cachedData?.cells?.length ? convertCellsToString(cachedData.cells) : '',
	);

	useEffect(() => {
		setMarkdown(
			data?.cells?.length ? convertCellsToString(data.cells) : '',
		);
	}, [data]);

	const height =
		(Math.max(1, dataRows.length) + 2) * cellHeight +
		(dataRows.length - 1) * rowGap;

	return { height, hasFocus: focus, markdown, processChange };
};

export default useEditableCanvas;
