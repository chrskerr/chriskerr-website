import type { RefObject } from 'react';

export type CellId = string | 'terminator';

export type Cell = {
	id: CellId;
	value: string;
};

export type EditableCanvasData = {
	id: string;
	cells: Cell[];
};

export type CursorPos = CellId;

export type RowCol = {
	row: number;
	col: number;
};

type ChangeId = string;

type EditableCanvasInsert = {
	type: 'insert';
	insert_before: CellId;
	cells: Cell[];
};

type EditableCanvasDelete = {
	type: 'delete';
	cells: Cell[];
};

export type EditableCanvasChange =
	| { up: EditableCanvasInsert; down: EditableCanvasDelete }
	| { up: EditableCanvasDelete; down: EditableCanvasInsert };

export type EditableCanvasChangeEvent = {
	id: ChangeId;
	change: EditableCanvasChange;
};

export type DataChangeHandler = (data: EditableCanvasData) => void;
export type ChangeEventHandler = (e: EditableCanvasChangeEvent) => void;

export interface UseEditableCanvasProps {
	ref: RefObject<HTMLCanvasElement>;
	cachedData: EditableCanvasData;
	onDataChange: DataChangeHandler;
	onEvent: ChangeEventHandler;
}

export enum FirebaseCollections {
	NOTES = 'notes',
	CHANGES = 'changes',
}

export interface StoredNote {
	cells: Cell[];
}

export interface StoredChangeData {
	data: EditableCanvasChangeEvent;
	created_at: string;
}

export type StoredChanges = {
	changes: StoredChangeData[];
	applied_to_note: boolean;
	change_id?: string;
	uploaded_at: string;
	note_id: string;
	sessionId: string;
};

export interface ReceivedStoredChange extends StoredChangeData {
	processed: boolean;
}

export type Directions = 'up' | 'right' | 'down' | 'left';

export interface UpdateNoteAPIBody {
	noteId: string;
	changes: {
		data: EditableCanvasChangeEvent;
		created_at: string;
	}[];
	uploaded_at: string;
	sessionId: string;
}

export interface UpdateNoteAPIResponse {
	noteId: string;
}
