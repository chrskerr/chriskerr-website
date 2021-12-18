
import throttle from "lodash/throttle";
import clamp from "lodash/clamp";

import { nanoid } from "nanoid";
import { useEffect, useMemo, useRef, useState } from "react";

import { 
	cellHeight,
	rowGap,

	splitDataIntoRows,
	getRowColForCursorPos,
	getCursorPosFromRowCol,
	getRowColAtMousePos,

	getParentInnerWidth,

	processChangeEvent,
	xor,
} from "./helpers";

import type {
	UseEditableCanvasProps, 
	CursorPos,
	RowCol,
	EditableCanvasChangeEvent,
	FirebaseChange,
	Directions,
} from "types";

import { serialise } from "./helpers/data-processing";
import { navigate } from "./helpers/navigate";
import { renderer } from "./helpers/render";
import { processDeleteEvent, processInsertEvent, processRedo, processUndo } from "./helpers/keypress";

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

	const processChange = useMemo(() => serialise(( event: FirebaseChange ) => {
		const updatedData = processChangeEvent( dataRef.current, event.data );
		setData( updatedData );
	}, "created_at" ),[]);

	const addToHistory = ( item: EditableCanvasChangeEvent ) => {
		history.current = [ ...history.current, item ];
	};

	const navigateTo = ({ row, col }: RowCol ) => {
		setTimeout(() => {
			const currRow = dataAsRowsRef.current[ row ];
			const currRowLength = currRow?.length || 0;

			setCursorPos( 
				getCursorPosFromRowCol(
					{ row: clamp( row, 0, dataAsRowsRef.current.length - 1 ), col: clamp( col, 0, currRowLength ) }, 
					dataAsRowsRef.current, 
				),
			);
		}, 0 );
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
		let selectedTextStart: RowCol = { row: 0, col: 0 };
		let selectedTextEnd: RowCol = { row: 0, col: 0 };
		let isControlDepressed = false;
		let isMetaDepressed = false;

		let animationFrameReference: number | undefined = undefined;

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
			navigateTo( getRowColAtMousePos( e ));
		};

		const onMouseStart = ( e: MouseEvent ) => {
			isMouseDown = true;
			selectedTextStart = getRowColAtMousePos( e );
			selectedTextEnd = { row: 0, col: 0 };
		};

		const onMouseMove = throttle(( e: MouseEvent ) => {
			if ( !isMouseDown ) return;
			selectedTextEnd = getRowColAtMousePos( e );
		}, 20 );

		const onMouseUp = () => {
			isMouseDown = false;
		};

		const processInsertDelete = ( char: string ) => {
			if ( char.length > 1 && char !== "Enter" && char !== "Backspace" ) return;
			
			const { result, event } = char === "Backspace" ? 
				processDeleteEvent( cursorRowCol.current, dataRef.current, dataAsRowsRef.current, sessionId ) :
				processInsertEvent( char, cursorRowCol.current, dataRef.current, dataAsRowsRef.current, sessionId );
			
			setData( result );
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
			setData( result.updatedData );
		};

		const onKeyup = ( e: KeyboardEvent ) => {
			const { key } = e;
			if ( key === "Control" ) isControlDepressed = false;
			if ( key === "Meta" ) isMetaDepressed = false;
		};

		const onKeypress = ( e: KeyboardEvent ) => {			
			const { key } = e;

			if ([ "Shift", "Alt", "CapsLock", "Escape" ].includes( key )) return;
			else if ( key === "Control" ) isControlDepressed = true;
			else if ( key === "Meta" ) isMetaDepressed = true;
			else if ( key === "ArrowRight" ) doNavigate( "right" );
			else if ( key === "ArrowLeft" ) doNavigate( "left" );
			else if ( key === "ArrowUp" ) doNavigate( "up" );
			else if ( key === "ArrowDown" ) doNavigate( "down" );
			else if ( key === "z" && xor( isControlDepressed, isMetaDepressed )) onUndoRedo( "undo" );
			else if ( key === "y" && xor( isControlDepressed, isMetaDepressed )) onUndoRedo( "redo" );
			else if ( key === "Enter" ) processInsertDelete( "Enter" );
			else if ( key === "Backspace" ) processInsertDelete( "Backspace" );
			else processInsertDelete( key );

			e.preventDefault();
			e.stopPropagation();

			selectedTextStart = { row: 0, col: 0 };
			selectedTextEnd = { row: 0, col: 0 };
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
				requestAnimationFrame( render );
			};

			animationFrameReference = requestAnimationFrame( render );

			canvas.addEventListener( "keydown", onKeypress, false );
			canvas.addEventListener( "keyup", onKeyup, false );
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

			if ( animationFrameReference ) cancelAnimationFrame( animationFrameReference );
		};
	}, []);

	const markdown = data?.cells.map( cell => {
		return cell.value;
	}).join( "" ) || "";

	const height = (( Math.max( 1, dataRows.length ) + 2 ) * cellHeight ) + ( dataRows.length - 1 ) * rowGap;

	return { height, hasFocus: focus, markdown, processChange };
};

export default useEditableCanvas;
