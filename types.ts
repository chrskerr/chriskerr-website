import type { RefObject } from "react";

export type CellId = string | "terminator";

export type Cell = {
	id: CellId,
	value: string
}

export type EditableCanvasData = {
	id: string,
	cells: Cell[],
}

export type CursorPos = CellId;

export type RowCol = {
	row: number,
	col: number,
}

type ChangeId = string;

type EditableCanvasInsert = {
	type: "insert",
	insert_before: CellId,
	cells: Cell[]
}

type EditableCanvasDelete = {
	type: "delete",
	cells: Cell[]
}

type EditableCanvasChange = 
	{ up: EditableCanvasInsert, down: EditableCanvasDelete } |
	{ up: EditableCanvasDelete, down: EditableCanvasInsert };
	
export type EditableCanvasChangeEvent = {
	id: ChangeId,
	sessionId: string, 
	change: EditableCanvasChange,
}

export type DataChangeHandler = ( data: EditableCanvasData ) => void;
export type ChangeEventHandler = ( e: EditableCanvasChangeEvent ) => void;

export interface UseEditableCanvasProps {
	ref: RefObject<HTMLCanvasElement>,
	cachedData: EditableCanvasData,
	onDataChange: DataChangeHandler,
	onEvent: ChangeEventHandler,
	sessionId: string,
}

export enum FirebaseCollections {
	NOTES = "notes",
	CHANGES = "changes",
}

export interface FirebaseNote {
	cells: Cell[],
}

export interface FirebaseChange {
	data: EditableCanvasChangeEvent,
	applied_to_note: boolean,
	created_at: string,
	uploaded_at: string,
	note_id: string,
}

export interface ReceivedChangeEvent extends FirebaseChange {
	processed: boolean,	
}

export type Directions = "up" | "right" | "down" | "left"
