
import admin from "firebase-admin";

if ( !admin.apps.length ) {
	try {
		admin.initializeApp({
			credential: admin.credential.cert({
				projectId: "chrskerr-notes",
				clientEmail: "firebase-adminsdk-elmzt@chrskerr-notes.iam.gserviceaccount.com",
				privateKey: process.env.FIREBASE_PRIVATE_KEY
					? ( process.env.NEXT_PUBLIC_URL_BASE || "" ).includes( "localhost" )
						? process.env.FIREBASE_PRIVATE_KEY
						: JSON.parse( process.env.FIREBASE_PRIVATE_KEY )
					: undefined,
			}),
		});
	} catch ( e ) {
		console.error( admin );
		console.error( e );
	}
}

export const firebase = admin;
