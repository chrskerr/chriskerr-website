
import range from "lodash/range";
import throttle from "lodash/throttle";
import clamp from "lodash/clamp";

import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";

import { 
	cellHeight,
	cellWidth,
	rowGap,

	splitDataIntoRows,
	getRowColForCursorPos,
	getCursorPosFromRowCol,
	getRowColAtMousePos,

	getParentInnerWidth,

	getTargetCell,
	processInsert,
	processChangeEvent,
	processDelete,
	xor,
	invertChange,
} from "./helpers";

import type {
	UseEditableCanvasProps, 
	CursorPos,
	RowCol,
	Cell,
	EditableCanvasChangeEvent,
	EditableCanvasData,
} from "types";

const useEditableCanvas = ({ ref, cachedData, onChange, sessionId, receivedChanges }: UseEditableCanvasProps ) => {
	const [ , setHistory ] = useState<EditableCanvasChangeEvent[]>([]);
	const [ , setUndoneHistory ] = useState<EditableCanvasChangeEvent[]>([]);

	const [ , setProcessedChanges ] = useState<string[]>([]);

	const [ data, setData ] = useState( cachedData );
	const dataRef = useRef( data );

	const [ dataRows, setDataRows ] = useState( splitDataIntoRows( data, ref ));
	const dataAsRowsRef = useRef( dataRows );

	const [ focus, setFocus ] = useState( false );
	const focusRef = useRef( focus );

	const addToHistory = ( item: EditableCanvasChangeEvent ) => {
		setTimeout(() => {
			setData( d => {
				setHistory( h => [ ...h, item ]),
				onChange( item, d );
				return d;
			});
		}, 0 );
	};

	const addInsertToHistory = ( insert_before: string, cells: Cell[]) => {
		addToHistory({
			change : {
				up: { type: "insert", insert_before, cells },
				down: { type: "delete", cells },
			},
			sessionId,
			id: nanoid(),
		});
	};
	
	const addDeleteToHistory = ( insert_before: string, cells: Cell[]) => {
		addToHistory({
			change: {
				up: { type: "delete", cells },
				down: { type: "insert", insert_before, cells },
			},
			sessionId,
			id: nanoid(),
		});
	};

	const [ cursorPos, setCursorPos ] = useState<CursorPos>( "terminator" );
	const cursorRowCol = useRef( getRowColForCursorPos( cursorPos, dataAsRowsRef.current ));
	const retainedCol = useRef( 0 );

	const navigate = ( dir: "up" | "right" | "down" | "left" ) => {
		setData( d => {
			setCursorPos( pos => {
				const dataAsRows = dataAsRowsRef.current;
				const newPos = { ...cursorRowCol.current };
				
				newPos.col = retainedCol.current > newPos.col ? retainedCol.current : newPos.col;

				let currIndex = d.cells.findIndex(({ id }) => id === pos );
				if ( currIndex === -1 ) currIndex = d.cells.length;

				if ( dir === "up" && newPos.row > 0 ) {
					const newRow = dataAsRows[  -- newPos.row ];
					if ( newPos.col > newRow.length - 1 ) newPos.col = newRow.length - 1;

				} else if ( dir === "down" &&  newPos.row < dataAsRows.length - 1 ) {
					const newRow = dataAsRows[  ++ newPos.row ];
					if ( newPos.col > newRow.length - 1 ) newPos.col = newRow.length - 1;

				} else if ( dir === "right" || dir === "left" ) {
					const newCell = dir === "right" ? 
						d.cells[ currIndex + 1 ] : 
						d.cells[ currIndex - 1 ] || d.cells[ 0 ];
					
					const newCellId = newCell?.id || "terminator";
					retainedCol.current = getRowColForCursorPos( newCellId, dataAsRows ).col;

					return newCellId;
				}

				return getCursorPosFromRowCol( newPos, dataAsRowsRef.current );
			});

			return d;
		});
	};

	const navigateTo = ({ row, col }: RowCol ) => {
		setTimeout(() => {
			const currRow = dataAsRowsRef.current[ row ];
			const currRowLength = currRow?.length || 0;

			setCursorPos(
				getCursorPosFromRowCol(
					{
						row: clamp( row, 0, dataAsRowsRef.current.length - 1 ),
						col: clamp( col, 0, currRowLength ),
					}, 
					dataAsRowsRef.current, 
				),
			);
		}, 0 );
	};

	useEffect(() => {
		if ( !data ) setData({ id: nanoid(), cells: []});
		else {
			const newDataRows = splitDataIntoRows( data, ref );
			dataAsRowsRef.current = newDataRows;
			setDataRows( newDataRows );
			dataRef.current = data;
		}
	}, [ data ]);

	useEffect(() => {
		cursorRowCol.current = getRowColForCursorPos( cursorPos, dataAsRowsRef.current );
	}, [ cursorPos, data ]);

	useEffect(() => {
		focusRef.current = focus;
	}, [ focus ]);

	useEffect(() => {
		setData( d => {
			let updatedData = { ...d };
			setProcessedChanges( processedChanges => {
				const newChanges = receivedChanges.filter(({ data }) => !processedChanges.includes( data.id ));

				updatedData = newChanges.reduce<EditableCanvasData>(
					( acc, changeData ) => processChangeEvent( acc, changeData.data ),
					data, 
				); 

				onChange( null, updatedData );

				return [ ...processedChanges, ...newChanges.map(({ data }) => data.id ) ];
			});
			return updatedData;
		});
	}, [ receivedChanges ]);

	useEffect(() => {
		let isMouseDown = false;
		let selectedTextStart: RowCol = { row: 0, col: 0 };
		let selectedTextEnd: RowCol = { row: 0, col: 0 };
		let isControlDepressed = false;
		let isMetaDepressed = false;

		const onResize = throttle(() => {
			if ( !ref.current ) return;

			const canvas = ref.current;
			canvas.width = getParentInnerWidth( canvas ) || canvas.width;

			const newDataRows = splitDataIntoRows( data, ref );
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

		const insertCharacter = ( char: string ) => {
			if ( char.length > 1 ) return;
			setData( d => {		
				const targetCell = getTargetCell( cursorRowCol.current, dataAsRowsRef.current );
				const targetId = targetCell?.id || "terminator";

				const { result, newCells } = processInsert({ 
					data: d, 
					targetId, 
					char, 
				});
			
				addInsertToHistory( targetId, newCells );

				return result;
			});
			setUndoneHistory([]);
		};

		const onEnter = () => {
			setData( d => {
				const targetCell = getTargetCell( cursorRowCol.current, dataAsRowsRef.current );
				const targetId = targetCell?.id || "terminator";

				const { result, newCells } = processInsert({ 
					data: d, 
					targetId, 
					char: "Enter", 
				});
			
				addInsertToHistory( targetId, newCells );

				return result;
			});
		};

		const onDelete = () => {
			setData( d => {
				const targetCell = getTargetCell( cursorRowCol.current, dataAsRowsRef.current );
				const targetId = targetCell?.id || "terminator";

				const { result, deletedCells } = processDelete({
					data: d,
					targetId,
					count: 1,
				}); 

				addDeleteToHistory( targetId, deletedCells );

				return result;
			});
		};

		const onUndo = async () => {
			const latestChange = await new Promise<EditableCanvasChangeEvent | undefined>( resolve => {
				setHistory( h => {
					const history = [ ...h ];
					const latestChange = history.pop();
					resolve( latestChange );

					return history;
				});
			});

			if ( !latestChange ) return;

			const updatedData = await new Promise<EditableCanvasData | undefined>( resolve => {
				setUndoneHistory( u => {
					const undoes = [ ...u ];

					const invertedChange = invertChange( latestChange );

					const result = processChangeEvent( dataRef.current, invertedChange );

					resolve( result );
					onChange( invertedChange, result );

					return [ ...undoes, latestChange ];

				});
			});

			if ( updatedData ) setData( updatedData );
		};

		const onRedo = async () => {
			const latestUndo = await new Promise<EditableCanvasChangeEvent | undefined>( resolve => {
				setUndoneHistory( u => {
					const undoes = [ ...u ];
					const latestUndo = undoes.pop();

					resolve( latestUndo );

					return undoes;
				});
			});

			if ( !latestUndo ) return;

			const updatedData = await new Promise<EditableCanvasData | undefined>( resolve => {
				setHistory( h => {
					const history = [ ...h ];
			
					const result = processChangeEvent( dataRef.current, latestUndo );

					resolve( result );
					onChange( latestUndo, result );

					return [ ...history, latestUndo ];

				});
			});

			if ( updatedData ) setData( updatedData );
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
			else if ( key === "ArrowRight" ) navigate( "right" );
			else if ( key === "ArrowLeft" ) navigate( "left" );
			else if ( key === "ArrowUp" ) navigate( "up" );
			else if ( key === "ArrowDown" ) navigate( "down" );
			else if ( key === "Enter" ) onEnter();
			else if ( key === "Backspace" ) onDelete();
			else if ( key === "z" && xor( isControlDepressed, isMetaDepressed )) onUndo();
			else if ( key === "y" && xor( isControlDepressed, isMetaDepressed )) onRedo();
			else insertCharacter( key );

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

			dataAsRowsRef.current = splitDataIntoRows( data, ref );

			if ( !ctx ) return;

			const render = ( timestamp: number ) => {
				if ( !canvas || !ctx ) return;

				ctx.clearRect( 0, 0, canvas.width, canvas.height );
				ctx.font = "16px 'IBM Plex Mono'";

				const isSelecting = ( selectedTextStart.row || selectedTextStart.col ) && ( selectedTextEnd.row || selectedTextEnd.col );

				const dataRows = dataAsRowsRef.current;

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
				const { row: cursorRow, col: cursorCol } = cursorRowCol.current;
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

				requestAnimationFrame( render );
			};

			requestAnimationFrame( render );

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
		};
	}, []);

	const markdown = data?.cells.map( cell => {
		return cell.value;
	}).join( "" ) || "";

	const height = (( Math.max( 1, dataRows.length ) + 2 ) * cellHeight ) + ( dataRows.length - 1 ) * rowGap;

	return { height, hasFocus: focus, markdown };
};

export default useEditableCanvas;
