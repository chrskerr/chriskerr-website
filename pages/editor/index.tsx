
import { firebase } from "lib/firebase-admin";
import { GetServerSideProps } from "next";
import { generateSlug, RandomWordOptions } from "random-word-slugs";
import { FirebaseCollections, FirebaseNote } from "types";

export default function EditorRoute () {
	return (
		<div />
	);
}

const idLength = 3;
const idOptions: RandomWordOptions<typeof idLength> = {
	format: "kebab",
	partsOfSpeech: [ "adjective", "adjective", "noun" ],
	categories: {
		noun: [ "animals", "food", "place", "science", "technology" ],
	},
};

const getId = () => generateSlug( idLength, idOptions );

export const getServerSideProps: GetServerSideProps = async () => {
	
	const createNote = async ( id: string ): Promise<string> => {
		try {
			await firebase
				.firestore()
				.collection( FirebaseCollections.NOTES )
				.doc( id )
				.create({ cells: []} as FirebaseNote );
			return id;
	
		} catch ( e ) {
			return createNote( getId());
	
		}
	};

	const id = await createNote( getId());

	return {
		redirect: {
			destination: `/editor/${ id }`,
			permanent: false,
		},
	};
};
