
import { DataChangeHandler, EditableCanvasData, ChangeEventHandler, FirebaseChange, FirebaseCollections, FirebaseNote } from "types";
import { socketServerUrl } from "socket-server/constants";

import type { GetServerSideProps } from "next";

import useEditableCanvas from "components/editable-canvas/use-editable-canvas";
import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { firestore } from "lib/firebase-admin";
import { processChangeEvent } from "components/editable-canvas/helpers";
import { nanoid } from "nanoid";
const MarkdownRenderer = dynamic( import( /* webpackPrefetch: true */ "components/editable-canvas/markdown-renderer" ));

import { io } from "socket.io-client";
import { useRouter } from "next/router";
import serialize from "async-function-serializer";
import { PublishChangeResponse, UpdateNoteAPIBody } from "pages/api/editor/publish-change";

export const getDateValueString = () => String( new Date().valueOf());

export const uploadChangeEvent = async ( body: UpdateNoteAPIBody ) => {
	const res = await fetch( "/api/editor/publish-change", {
		method: "post",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ ...body, uploaded_at: getDateValueString() }),
	});
	if ( res.ok ) {
		const data = await res.json() as PublishChangeResponse;
		return data?.note_id;
	}
};

interface EditorProps {
	id: string,
	initialData: EditableCanvasData,
}

export default function Editor ({ id, initialData }: EditorProps ) {
	const router = useRouter();

	const $_ref = useRef<HTMLCanvasElement>( null );

	const $_idRef = useRef( id );
	useEffect(() => {
		$_idRef.current = id;
	}, [ id ]);

	const [ cachedData, setCachedData ] = useState( initialData );
	const [ sessionId ] = useState( nanoid());

	const onDataChange: DataChangeHandler = ( data ) => {
		setTimeout(() => {
			setCachedData( data );
		}, 0 );
	};

	const postChangeEvent = useCallback( 
		serialize( 
			uploadChangeEvent, 
			{ 
				sortBy: { key: "created_at" },
				inputTransformer: async ( data, previousResult ) => {
					if ( previousResult ) data.noteId = previousResult;
					if ( data.noteId !== $_idRef.current ) await router.push( `/editor/${ data.noteId }`, undefined, { shallow: true });
					return data;
				},
			},
		), 
		[],
	);
	
	
	const onEvent: ChangeEventHandler = async ( e ) => {
		await postChangeEvent({
			noteId: id,
			change: e,
			created_at: getDateValueString(),
			uploaded_at: "",
		});
	};

	const { markdown, height, hasFocus, processChange } = useEditableCanvas({ ref: $_ref, cachedData, onDataChange, onEvent, sessionId });

	const [ tab, setTab ] = useState<"editor" | "viewer">( "editor" );

	useEffect(() => {
		const socket = io( socketServerUrl );
		
		socket.emit( "join", id );

		socket.on( "change", ( message: FirebaseChange ) => {
			if ( message.data.sessionId !== sessionId ) {
				processChange( message );
			}
		});

		return () => {
			socket.close();
		};
	}, []);

	const href = `https://www.chriskerr.com.au/editor/${ id }`;

	const classes = `
		p-8 border-2 mt-2 w-full
		${ hasFocus ? "border-brand" : "" }
	`;

	return (
		<>
			<div className="display-width">
				<p className="mb-4">This is a work in progress of a fully custom canvas based text editor.</p>
				<p className="mb-2 text-lg">Ideas &amp; Problems list:</p>
				<ul className="list-disc sm:columns-3">
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
				<div className={ `w-full pb-16 mr-0 2xl:mr-4 2xl:pb-0 ${ tab === "editor" ? "" : "hidden" }` }>
					<div className={ classes }>
						<canvas ref={ $_ref } height={ height } width="auto" className="outline-none" />
					</div>
				</div>
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

	if ( id === "new" ) {
		const props: EditorProps = {
			initialData: { id: "new", cells: []},
			id,
		};

		return {
			props, 
		};
	}

	const docRef = firestore.collection( FirebaseCollections.NOTES ).doc( id );
	const changesRef = docRef.collection( FirebaseCollections.CHANGES );

	const initialData = await firestore.runTransaction( async ( txn ) => {
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