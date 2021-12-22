
import { firestore } from "lib/firebase-admin";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { Cell, EditableCanvasChangeEvent, FirebaseChange, FirebaseCollections, FirebaseNote } from "types";
import { socketServerUrl, apiToken } from "socket-server/constants";

import { generateSlug, RandomWordOptions } from "random-word-slugs";

export interface UpdateNoteAPIBody {
	noteId: string,
	change: EditableCanvasChangeEvent,
	created_at: string,
	uploaded_at: string,
}

const origin = process.env.NEXT_PUBLIC_URL_BASE;

const idLength = 3;
const idOptions: RandomWordOptions<typeof idLength> = {
	format: "kebab",
	partsOfSpeech: [ "adjective", "adjective", "noun" ],
	categories: {
		noun: [ "animals", "food", "place", "science", "technology" ],
	},
};

const getId = () => generateSlug( idLength, idOptions );

const createNewId = async ( cells: Cell[]): Promise<string> => {
	const id = getId();
	try {
		await firestore
			.collection( FirebaseCollections.NOTES )
			.doc( id )
			.create({ cells } as FirebaseNote );
		return id;

	} catch ( e ) {
		return createNewId( cells );

	}
};

export interface PublishChangeResponse {
	note_id: string,
}

const handler: NextApiHandler = async ( req, res ) => {
	await NextCors( req, res, {
		origin,
		methods: [ "POST" ],
	});

	if ( req.headers.origin !== origin || req.method?.toUpperCase() !== "POST" ) return res.status( 500 ).end();

	const body = req.body as UpdateNoteAPIBody;
	let { noteId: note_id } = body;

	if ( !note_id || note_id === "new" ) {
		note_id = await createNewId( body.change.change.up.cells );

	} else {
		await firestore
			.collection( FirebaseCollections.NOTES ).doc( body.noteId )
			.collection( FirebaseCollections.CHANGES ).add({
				applied_to_note: false,
				data: body.change,
				note_id,
				created_at: body.created_at,
				uploaded_at: body.uploaded_at,
			} as FirebaseChange );

	}

	await fetch( socketServerUrl + "/editor", {
		method: "post",
		headers: { "content-type": "application/json", token: apiToken },
		body: JSON.stringify({
			applied_to_note: false,
			data: body.change,
			note_id,
			created_at: body.created_at,
			uploaded_at: body.uploaded_at,
		} as FirebaseChange ),
	});

	return res.status( 200 ).json({ note_id } as PublishChangeResponse );
};

export default handler;
