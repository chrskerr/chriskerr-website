
import { EditableCanvasData, EditableCanvasProps, EditableChangeHandler, FirebaseChange, FirebaseCollections, FirebaseNote } from "types";
import { socketServerUrl } from "socket-server/constants";

import type { UpdateNoteAPIBody } from "pages/api/editor/publish-change";
import type { GetServerSideProps } from "next";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import EditableCanvas from "components/editable-canvas";
import { firebase } from "lib/firebase-admin";
import { processChangeEvent } from "components/editable-canvas/helpers";
import { nanoid } from "nanoid";
const MarkdownRenderer = dynamic( import( /* webpackPrefetch: true */ "components/markdown-renderer" ));

import { io } from "socket.io-client";

const getDateValueString = () => String( new Date().valueOf());

const uploadChangeEvent = async ( body: UpdateNoteAPIBody ) => fetch( "/api/editor/publish-change", {
	method: "post",
	headers: { "content-type": "application/json" },
	body: JSON.stringify({ ...body, uploaded_at: getDateValueString() }),
});

function postChangeEventThrottle () {
	const queue: UpdateNoteAPIBody[] = [];

	async function start ( data: UpdateNoteAPIBody ) {
		await uploadChangeEvent( data );
		queue.shift();
		if ( queue.length ) {
			start( queue[ 0 ]);
			queue.sort(( a, b ) => Number( a.created_at ) - Number( b.created_at ));
		}
	}

	return function ( data: UpdateNoteAPIBody ) {
		if ( queue.length ) {
			queue.push( data );
		} else {
			start( data );
		}
	}; 
}

const postChangeEvent = postChangeEventThrottle();

interface EditorProps {
	id: string,
	initialData: EditableCanvasData,
}

export default function Editor ({ id, initialData }: EditorProps ) {
	const [ markdown, setMarkdown ] = useState( "" );
	const [ cachedData, setCachedData ] = useState( initialData );
	const [ sessionId ] = useState( nanoid());

	const [ receivedChanges, setReceivedChanges ] = useState<FirebaseChange[]>([]);

	const [ tab, setTab ] = useState<"editor" | "viewer">( "editor" );

	const onChange: EditableChangeHandler = ( e, data ) => {
		setTimeout(() => {
			setCachedData( data );
			if ( e ) {
				postChangeEvent({
					noteId: id || e.id,
					change: e,
					created_at: getDateValueString(),
					uploaded_at: "",
				});
			}
		}, 0 );
	};

	const editableCanvasProps: EditableCanvasProps = {
		cachedData, 
		setMarkdown,
		onChange,
		sessionId,
		receivedChanges,
	};

	useEffect(() => {
		const socket = io( socketServerUrl );
		
		socket.emit( "join", id );

		socket.on( "change", ( message: FirebaseChange ) => {
			if ( message.data.sessionId !== sessionId ) {
				setReceivedChanges( current => {
					return [ ...current, message ]
						.sort(( a, b ) => Number( a.uploaded_at ) - Number( b.uploaded_at ));
				});
			}
		});

		return () => {
			socket.close();
		};
	}, []);

	const href = `https://www.chriskerr.com.au/editor/${ id }`;

	return (
		<>
			<div className="display-width">
				<p className="mb-4">This is a work in progress of a fully custom canvas based text editor.</p>
				<p className="mb-2 text-lg">Ideas &amp; Problems list:</p>
				<ul className="list-disc sm:columns-3">
					<li className="ml-4">Copy &amp; paste</li>
					<li className="ml-4">Pressing forward after typing skips two letters</li>
					<li className="ml-4">Pretty sure it doesn&apos;t work on iPhone</li>
				</ul>
			</div>
			<div className="w-full text-center display-width divider-before">
				<div className="mb-16">
					<h1 className="mb-4 text-xl">ID: { id }</h1>
					<p className="mb-2">Permament link: <a href={ href } target="_blank" rel="noreferrer" className="hover:underline text-brand">{ href }</a></p>
					<p>Share me to realtime collaborate and write with anyone who has the link :)</p>
				</div>
				<div className="flex items-center justify-center w-full">
					<h2 onClick={ () => setTab( "editor" ) } className={ `${ tab === "editor" ? "underline underline-offset-8 decoration-brand decoration-wavy" : "" } text-2xl mr-4 cursor-pointer` }>Editor</h2>
					<h2 onClick={ () => setTab( "viewer" ) } className={ `${ tab === "viewer" ? "underline underline-offset-8 decoration-brand decoration-wavy" : "" } text-2xl ml-4 cursor-pointer` }>Viewer</h2>
				</div>
			</div>
			<div className="flex items-center justify-center display-width divider-before">
				{ tab === "editor" &&
					<div className="w-full pb-16 mr-0 2xl:mr-4 2xl:pb-0">
						<EditableCanvas { ...editableCanvasProps } />
					</div>
				}
				{ tab === "viewer" && 
					<div className="w-full ml-0 2xl:ml-4">
						<MarkdownRenderer markdown={ markdown } />
					</div>
				}
			</div>

		</>
	);
}

export const getServerSideProps: GetServerSideProps = async ( context ) => {
	const id = Array.isArray( context.query.id ) ? context.query.id[ 0 ] : context.query.id;

	fetch( socketServerUrl );

	if ( !id ) {
		return {
			notFound: true,
		};
	}

	const docRef = firebase.firestore().collection( FirebaseCollections.NOTES ).doc( id );
	const changesRef = docRef.collection( FirebaseCollections.CHANGES );

	const initialData = await firebase.firestore().runTransaction( async ( txn ) => {
		let data: EditableCanvasData | false = false;

		try {
			const [ doc, changes ] = await Promise.all([
				txn.get( docRef ),
				txn.get( changesRef.where( "applied_to_note", "==", false )),
			]);
	
			if ( !doc.exists ) {
				return false;
			}
		
			const sortedChanges = changes.docs
				.map( doc => ({
					id: doc.id,
					data: doc.data() as FirebaseChange,
				}))
				.sort(( a, b ) => Number( a.data.created_at ) - Number( b.data.created_at ));
	
			data = sortedChanges.reduce<EditableCanvasData>(
				( acc, changeData ) => {
					if ( changeData.data.applied_to_note ) return acc;
					return processChangeEvent( acc, changeData.data.data );
				}, 
				{
					...doc.data() as FirebaseNote,
					id: doc.id,
				}, 
			);

			txn.update( docRef, { cells: data.cells } as Partial<FirebaseNote> );
			sortedChanges.forEach(({ id }) => {
				txn.update( changesRef.doc( id ), { applied_to_note: true } as Partial<FirebaseChange> );
			});
			
		} catch ( e ) {
			console.log( e );
			
		}

		return data;
	}); 

	if ( !initialData ) {
		return {
			notFound: true,
		};
	}

	const props: EditorProps = {
		initialData,
		id,
	};

	return {
		props,
	};
};