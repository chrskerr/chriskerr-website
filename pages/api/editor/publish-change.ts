
import { firebase } from "lib/firebase-admin";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { EditableCanvasChangeEvent, FirebaseChange, FirebaseCollections } from "types";
import { socketServerUrl, apiToken } from "socket-server/constants";

export interface UpdateNoteAPIBody {
	noteId: string,
	change: EditableCanvasChangeEvent,
	created_at: string,
	uploaded_at: string,
}

const origin = process.env.NEXT_PUBLIC_URL_BASE;

const handler: NextApiHandler = async ( req, res ) => {
	await NextCors( req, res, {
		origin,
		methods: [ "POST" ],
	});

	if ( req.headers.origin !== origin || req.method?.toUpperCase() !== "POST" ) return res.status( 500 ).end();

	const body = req.body as UpdateNoteAPIBody;
	const insert: FirebaseChange = {
		applied_to_note: false,
		data: body.change,
		note_id: body.noteId,
		created_at: body.created_at,
		uploaded_at: body.uploaded_at,
	};

	await Promise.all([
		firebase.firestore()
			.collection( FirebaseCollections.NOTES ).doc( body.noteId )
			.collection( FirebaseCollections.CHANGES ).add( insert ),
		fetch( socketServerUrl, {
			method: "post",
			headers: { "content-type": "application/json", token: apiToken },
			body: JSON.stringify( insert ),
		}),
	]);	

	return res.clearPreviewData().end();
};

export default handler;
