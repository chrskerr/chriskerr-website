
import throttle from "lodash/throttle";

import { nanoid } from "nanoid";
import { useEffect, useMemo, useRef, useState } from "react";

import { 
	cellHeight,
	rowGap,

	splitDataIntoRows,

	getParentInnerWidth,

	processChangeEvent,
	xor,
} from "./helpers";

import {
	getRowColForCursorPos,
	getCursorPosFromRowCol,
	getRowColAtMousePos,

} from "./helpers/cursor";

import type {
	UseEditableCanvasProps, 
	CursorPos,
	RowCol,
	EditableCanvasChangeEvent,
	FirebaseChange,
	Directions,
	EditableCanvasData,
} from "types";

import serialize from "async-function-serializer";
import { navigate } from "./helpers/navigate";
import { renderer } from "./helpers/render";
import { processDeleteEvent, processDeleteMany, processInsertEvent, processRedo, processUndo, processPaste } from "./helpers/data";
import { convertCellsToString } from "./helpers/transforms";

const useEditableCanvas = ({ ref, cachedData, onDataChange, onEvent, sessionId }: UseEditableCanvasProps ) => {
	const history = useRef<EditableCanvasChangeEvent[]>([]);
	const undoStack = useRef<EditableCanvasChangeEvent[]>([]);

	const [ data, setData ] = useState( cachedData );
	const dataRef = useRef( data );

	const [ dataRows, setDataRows ] = useState( ref.current ? splitDataIntoRows( data, ref.current ) : []);
	const dataAsRowsRef = useRef( dataRows );

	const [ focus, setFocus ] = useState( false );
	const focusRef = useRef( focus );

	const [ cursorPos, setCursorPos ] = useState<CursorPos>( "terminator" );
	const cursorPosRef = useRef<CursorPos>( cursorPos );
	const cursorRowCol = useRef<RowCol>( getRowColForCursorPos( cursorPos, dataAsRowsRef.current ));
	const retainedCol = useRef( 0 );

	const immediatelyUpdateData = ( data: EditableCanvasData ) => {
		if ( !ref.current ) return;

		setData( data );
		dataRef.current = data;

		const dataRows = splitDataIntoRows( data, ref.current );
		setDataRows( dataRows );
		dataAsRowsRef.current = dataRows;
	};

	const immediatelyUpdateCursorPos = ( pos?: CursorPos ) => {
		if ( !pos || !dataRef.current.cells.some(({ id }) => id === pos )) return; 
		setCursorPos( pos );
		cursorPosRef.current = pos;
		cursorRowCol.current = getRowColForCursorPos( pos, dataAsRowsRef.current );
	};

	const processChange = useMemo(() => serialize(( event: FirebaseChange ) => {
		const updatedData = processChangeEvent( dataRef.current, event.data );
		setData( updatedData );
	}, { sortBy: { key: "created_at" }}),[]);

	const addToHistory = ( item: EditableCanvasChangeEvent ) => {
		history.current = [ ...history.current, item ];
	};

	const doNavigate = ( dir: Directions ) => {
		if ( !ref.current ) return;

		const { newCursorPos, newRetainedCol, newRowCol } = navigate({
			dir,
			data: dataRef.current,
			ref: ref.current,
			cursorPos: cursorPosRef.current,
			retainedCol: retainedCol.current,
		});

		retainedCol.current = newRetainedCol;
		setCursorPos( newCursorPos );
		cursorRowCol.current = newRowCol;
	};

	useEffect(() => {
		if ( !data ) setData({ id: nanoid(), cells: []});
		else {
			if ( !ref.current ) return;
			const newDataRows = splitDataIntoRows( data, ref.current );
			dataAsRowsRef.current = newDataRows;
			setDataRows( newDataRows );
			dataRef.current = data;
			onDataChange( data );
		}
	}, [ data ]);

	useEffect(() => {
		cursorPosRef.current = cursorPos;
		cursorRowCol.current = getRowColForCursorPos( cursorPos, dataRows );

	}, [ cursorPos, dataRows ]);

	useEffect(() => {
		focusRef.current = focus;
	}, [ focus ]);

	useEffect(() => {
		let isMouseDown = false;
		let selectedTextStart: RowCol | undefined = undefined;
		let selectedTextEnd: RowCol | undefined = undefined;
		
		let isControlDepressed = false;
		let isMetaDepressed = false;
		let isAltDepressed = false;

		let isRunning = true;

		const onResize = throttle(() => {
			if ( !ref.current ) return;

			const canvas = ref.current;
			canvas.width = getParentInnerWidth( canvas ) || canvas.width;

			const newDataRows = splitDataIntoRows( data, ref.current );
			dataAsRowsRef.current = newDataRows;
			setDataRows( newDataRows );
		}, 20 );

		const onFocusIn = () => {
			setFocus( true );
		};

		const onFocusOut = () => {
			setFocus( false );
		};

		const onClick = ( e: MouseEvent ) => {
			const clickedRowCol = getRowColAtMousePos( e, dataAsRowsRef.current );
			const updatedCursorPos = getCursorPosFromRowCol( clickedRowCol, dataAsRowsRef.current );
			immediatelyUpdateCursorPos( updatedCursorPos );
		};

		const onMouseStart = () => {
			isMouseDown = true; 
			selectedTextStart = undefined;
			selectedTextEnd = undefined;
		};

		const onMouseMove = throttle(( e: MouseEvent ) => {
			if ( !isMouseDown ) return;
			if ( !selectedTextStart ) selectedTextStart = getRowColAtMousePos( e, dataAsRowsRef.current );
			selectedTextEnd = getRowColAtMousePos( e, dataAsRowsRef.current );
		}, 20 );

		const onMouseUp = () => {
			isMouseDown = false;
		};

		const processInsertDelete = ( char: string ) => {
			if ( char.length > 1 && char !== "Enter" && char !== "Backspace" ) return;

			if ( selectedTextStart && selectedTextEnd ) {
				const cutCopyResults = processDeleteMany({ data: dataRef.current, dataAsRows: dataAsRowsRef.current, selectedTextStart, selectedTextEnd, sessionId });
				if ( cutCopyResults ) {
					const { updatedData, event, updatedCursorPos } = cutCopyResults;
					immediatelyUpdateData( updatedData );
					immediatelyUpdateCursorPos( updatedCursorPos );
					addToHistory( event );
					onEvent( event );

				}
			}

			if ( selectedTextStart && selectedTextEnd && char === "Backspace" ) return;
			
			const { result, event } = char === "Backspace" ? 
				processDeleteEvent( cursorRowCol.current, dataRef.current, dataAsRowsRef.current, sessionId ) :
				processInsertEvent( char, cursorRowCol.current, dataRef.current, dataAsRowsRef.current, sessionId );
			
			immediatelyUpdateData( result );
			addToHistory( event );
			onEvent( event );
			
			undoStack.current = [];
		};

		const onUndoRedo = async ( mode: "undo" | "redo" ) => {
			const result = mode === "undo" ? 
				processUndo({ history: history.current, undoStack: undoStack.current, data: dataRef.current }) :
				processRedo({ history: history.current, undoStack: undoStack.current, data: dataRef.current });
			if ( !result ) return;

			history.current = result.updatedHistory;
			undoStack.current = result.updatedUndoStack;

			onEvent( result.event );
			immediatelyUpdateData( result.updatedData );
		};

		const onCutCopy = ( mode: "cut" | "copy" ) => {
			if ( !selectedTextStart || !selectedTextEnd ) return;
			const deleteManyResult = processDeleteMany({ 
				data: dataRef.current, 
				dataAsRows: dataAsRowsRef.current, 
				selectedTextStart, 
				selectedTextEnd, 
				sessionId, 
				copyToClipboard: true, 
			});

			if ( deleteManyResult && mode === "cut" ) {
				const { updatedData, event, updatedCursorPos } = deleteManyResult;
				immediatelyUpdateData( updatedData );
				immediatelyUpdateCursorPos( updatedCursorPos );
				addToHistory( event );
				onEvent( event );

			}
		};

		const onPaste = async () => {
			const pastedString = await navigator.clipboard.readText();
			if ( !pastedString || typeof pastedString !== "string" ) return;

			if ( selectedTextStart && selectedTextEnd ) {
				const cutCopyResults = processDeleteMany({ data: dataRef.current, dataAsRows: dataAsRowsRef.current, selectedTextStart, selectedTextEnd, sessionId });
				if ( cutCopyResults ) {
					const { updatedData, event, updatedCursorPos } = cutCopyResults;
					immediatelyUpdateData( updatedData );
					immediatelyUpdateCursorPos( updatedCursorPos );
					addToHistory( event );
					onEvent( event );

				}
			}

			const pasteResults = processPaste({ data: dataRef.current, pastedString, sessionId, cursorPos: cursorPosRef.current });
			if ( pasteResults ) {
				const { updatedData, event } = pasteResults;
				immediatelyUpdateData( updatedData );
				addToHistory( event );
				onEvent( event );
			}
		};

		const onKeyup = ( e: KeyboardEvent ) => {
			const { key } = e;
			if ( key === "Control" ) isControlDepressed = false;
			if ( key === "Meta" ) isMetaDepressed = false;
			if ( key === "Alt" ) isAltDepressed = false;
		};

		const onKeypress = ( e: KeyboardEvent ) => {			
			const { key } = e;

			if ([ "Shift", "CapsLock", "Escape" ].includes( key ) || isAltDepressed ) {
				// do nothing;
			}
			else if ( key === "Control" ) isControlDepressed = true;
			else if ( key === "Alt" ) isAltDepressed = true;
			else if ( key === "Meta" ) isMetaDepressed = true;
			else if ( key === "ArrowRight" ) doNavigate( "right" );
			else if ( key === "ArrowLeft" ) doNavigate( "left" );
			else if ( key === "ArrowUp" ) doNavigate( "up" );
			else if ( key === "ArrowDown" ) doNavigate( "down" );
			else if ( key === "z" && xor( isControlDepressed, isMetaDepressed )) onUndoRedo( "undo" );
			else if ( key === "y" && xor( isControlDepressed, isMetaDepressed )) onUndoRedo( "redo" );
			else if ( key === "x" && xor( isControlDepressed, isMetaDepressed )) onCutCopy( "cut" );
			else if ( key === "c" && xor( isControlDepressed, isMetaDepressed )) onCutCopy( "copy" );
			else if ( key === "v" && xor( isControlDepressed, isMetaDepressed )) onPaste();
			else if ( key === "Enter" ) processInsertDelete( "Enter" );
			else if ( key === "Backspace" ) processInsertDelete( "Backspace" );
			else processInsertDelete( key );

			// e.preventDefault();
			// e.stopPropagation();

			if ( key !== "Control" && key !== "Meta" ) {
				selectedTextStart = undefined;
				selectedTextEnd = undefined;
			}
		};

		( async () => {
			let canvas = ref.current;
			while ( !canvas ) {
				await new Promise( res => setImmediate( res ));
				canvas = ref.current;
			}
			const ctx = canvas.getContext( "2d" );
			canvas.setAttribute( "tabIndex", "1" );
			canvas.style.cursor = "text";

			if ( !canvas ) return;
			canvas.width = getParentInnerWidth( canvas ) || canvas.width;

			dataAsRowsRef.current = splitDataIntoRows( data, canvas );

			if ( !ctx ) return;

			const render = ( timestamp: number ) => {
				if ( !canvas ) return;
				renderer({ timestamp, dataRows: dataAsRowsRef.current, canvas, ctx, cursorRowCol: cursorRowCol.current, selectedTextEnd, selectedTextStart });
				if ( isRunning ) requestAnimationFrame( render );
			};

			requestAnimationFrame( render );

			canvas.addEventListener( "keydown", onKeypress, { passive: true });
			canvas.addEventListener( "keyup", onKeyup, { passive: true });
			canvas.addEventListener( "focusin", onFocusIn, { passive: true });
			canvas.addEventListener( "focusout", onFocusOut, { passive: true });
			canvas.addEventListener( "click", onClick, { passive: true });
			canvas.addEventListener( "mousedown", onMouseStart, { passive: true });
			canvas.addEventListener( "mousemove", onMouseMove, { passive: true });
			canvas.addEventListener( "mouseup", onMouseUp, { passive: true });
			canvas.addEventListener( "mouseout", onMouseUp, { passive: true });
			window.addEventListener( "resize", onResize, { passive: true });
			
		})();
		
		return () => {
			ref.current?.removeEventListener( "keydown", onKeypress );
			ref.current?.removeEventListener( "keyup", onKeyup );
			ref.current?.removeEventListener( "focusin", onFocusIn );
			ref.current?.removeEventListener( "focusout", onFocusOut );
			ref.current?.removeEventListener( "click", onClick );
			ref.current?.removeEventListener( "mousedown", onMouseStart );
			ref.current?.removeEventListener( "mousemove", onMouseMove );
			ref.current?.removeEventListener( "mouseup", onMouseUp );
			ref.current?.removeEventListener( "mouseout", onMouseUp );
			window.removeEventListener( "resize", onResize );

			isRunning = false;
		};
	}, []);

	const [ markdown, setMarkdown ] = useState( cachedData?.cells?.length ? convertCellsToString( cachedData.cells ) : "" );

	useEffect(() => {
		setMarkdown( data?.cells?.length ? convertCellsToString( data.cells ) : "" );
	}, [ data ]);

	const height = (( Math.max( 1, dataRows.length ) + 2 ) * cellHeight ) + ( dataRows.length - 1 ) * rowGap;

	return { height, hasFocus: focus, markdown, processChange };
};

export default useEditableCanvas;
