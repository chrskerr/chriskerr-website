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

export type EditableCanvasChange = 
	{ up: EditableCanvasInsert, down: EditableCanvasDelete } |
	{ up: EditableCanvasDelete, down: EditableCanvasInsert };
	
export type EditableCanvasChangeEvent = {
	id: ChangeId,
	change: EditableCanvasChange,
}

export type DataChangeHandler = ( data: EditableCanvasData ) => void;
export type ChangeEventHandler = ( e: EditableCanvasChangeEvent ) => void;

export interface UseEditableCanvasProps {
	ref: RefObject<HTMLCanvasElement>,
	cachedData: EditableCanvasData,
	onDataChange: DataChangeHandler,
	onEvent: ChangeEventHandler,
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
	created_at: string,
}

export type FirebaseChanges = {
	changes: FirebaseChange[],
	applied_to_note: boolean,
	change_id?: string,
	uploaded_at: string,
	note_id: string,
	sessionId: string,
}

export interface ReceivedChangeEvent extends FirebaseChange {
	processed: boolean,	
}

export type Directions = "up" | "right" | "down" | "left"

export type Blog = {
	url: string,

	title: string,
	description: string,

	htmlContent: string,

	tags: string[],

	publishedAtISO: string,
	modifiedAtISO: string,

	publishedAtString: string,
	modifiedAtString: string,
}

export enum  BlogPostSlugs {
	ASYNC_FUNCTIONS = "serialising-async-functions"
}

export enum BlogPostTitles {
	ASYNC_FUNCTIONS = "Serialising Async Functions"
}
