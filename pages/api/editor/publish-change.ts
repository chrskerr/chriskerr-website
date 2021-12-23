
import { firestore } from "lib/firebase-admin";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { Cell, EditableCanvasChangeEvent, FirebaseChanges, FirebaseCollections, FirebaseNote } from "types";
import { socketServerUrl, apiToken } from "socket-server/constants";

import { generateSlug, RandomWordOptions } from "random-word-slugs";

export interface UpdateNoteAPIBody {
	noteId: string,
	change: EditableCanvasChangeEvent,
	created_at: string,
	uploaded_at: string,
	sessionId: string,
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
		const createData: FirebaseNote = { cells };
		await firestore
			.collection( FirebaseCollections.NOTES )
			.doc( id )
			.create( createData );
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
		const insertData: FirebaseChanges = {
			uploaded_at: body.uploaded_at,
			applied_to_note: false,
			note_id,
			changes: [{
				data: body.change,
				created_at: body.created_at,
			}],
			sessionId: body.sessionId,
		};

		await firestore
			.collection( FirebaseCollections.NOTES ).doc( body.noteId )
			.collection( FirebaseCollections.CHANGES ).add( insertData );

	}

	const socketData: FirebaseChanges = {
		uploaded_at: body.uploaded_at,
		applied_to_note: false,
		note_id,
		changes: [{
			data: body.change,
			created_at: body.created_at,
		}],
		sessionId: body.sessionId,
	};

	await fetch( socketServerUrl + "/editor", {
		method: "post",
		headers: { "content-type": "application/json", token: apiToken },
		body: JSON.stringify( socketData ),
	});

	const response: PublishChangeResponse = { note_id };

	return res.status( 200 ).json( response );
};

export default handler;
