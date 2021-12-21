
import { firestore } from "lib/firebase-admin";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { EditableCanvasChangeEvent, FirebaseChange, FirebaseCollections, FirebaseNote } from "types";
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

const createNote = async (): Promise<string> => {
	const id = getId();
	try {
		await firestore
			.collection( FirebaseCollections.NOTES )
			.doc( id )
			.create({ cells: []} as FirebaseNote );
		return id;

	} catch ( e ) {
		return createNote();

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
	const note_id = body.noteId && body.noteId !== "new" ? body.noteId : await createNote();

	const insert: FirebaseChange = {
		applied_to_note: false,
		data: body.change,
		note_id,
		created_at: body.created_at,
		uploaded_at: body.uploaded_at,
	};

	await Promise.all([
		firestore
			.collection( FirebaseCollections.NOTES ).doc( body.noteId )
			.collection( FirebaseCollections.CHANGES ).add( insert ),
		fetch( socketServerUrl + "/editor", {
			method: "post",
			headers: { "content-type": "application/json", token: apiToken },
			body: JSON.stringify( insert ),
		}),
	]);	

	return res.status( 200 ).json({ note_id } as PublishChangeResponse );
};

export default handler;
