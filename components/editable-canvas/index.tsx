import { NextSeo } from 'next-seo';
import {
	DataChangeHandler,
	EditableCanvasData,
	ChangeEventHandler,
	StoredChanges,
	UpdateNoteAPIResponse,
	UpdateNoteAPIBody,
} from 'types/editor';
import { socketServerUrl, unsavedNoteId } from 'lib/constants';

import useEditableCanvas from 'components/editable-canvas/use-editable-canvas';
import { useEffect, useState, useRef, useCallback } from 'react';
import { nanoid } from 'nanoid';

import dynamic from 'next/dynamic';
const MarkdownRenderer = dynamic(
	import(
		/* webpackPrefetch: true */ 'components/editable-canvas/markdown-renderer'
	),
);

import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/router';
import serialize from 'async-function-serializer';
import { ParsedUrlQuery } from 'querystring';

export const getDateValueString = () => String(new Date().valueOf());

export const uploadChangeEvent = async (body: UpdateNoteAPIBody) => {
	const res = await fetch(`${socketServerUrl}/editor/${body.noteId}`, {
		method: 'post',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ ...body, uploaded_at: getDateValueString() }),
	});
	if (res.ok) {
		const data = (await res.json()) as UpdateNoteAPIResponse;
		return data?.noteId;
	}
};

interface EditorProps {
	id: string;
	initialData: EditableCanvasData;
}

const title = 'Collaborative Markdown Editor';

function getIdFromQuery(query: ParsedUrlQuery): string | undefined {
	return Array.isArray(query.id) ? query.id[0] : query.id;
}

export default function Editor({ id: propsId, initialData }: EditorProps) {
	const router = useRouter();

	const [id, setId] = useState<string>(
		getIdFromQuery(router.query) || propsId,
	);

	useEffect(() => {
		setId(getIdFromQuery(router.query) || propsId);
	}, [router.query.id, propsId]);

	const $_ref = useRef<HTMLCanvasElement>(null);

	const $_idRef = useRef<string>(id);
	useEffect(() => {
		$_idRef.current = id;
	}, [id]);

	const [cachedData, setCachedData] = useState(initialData);
	const [sessionId] = useState(nanoid());

	const onDataChange: DataChangeHandler = data => {
		setTimeout(() => {
			setCachedData(data);
		}, 0);
	};

	const postChangeEvent = useCallback(
		serialize(uploadChangeEvent, {
			inputTransformer: async (data, previousResult) => {
				if (previousResult) data.noteId = previousResult;
				if (data.noteId !== $_idRef.current) {
					setId(data.noteId);
					await router.push(`/editor/${data.noteId}`, undefined, {
						shallow: true,
					});
				}
				return data;
			},
			batch: {
				debounceInterval: 500,
				maxDebounceInterval: 1500,
				batchTransformer: (batch, newChange) => {
					if (!batch) return newChange;
					newChange.changes = [
						...batch.changes,
						...newChange.changes,
					];
					return newChange;
				},
			},
		}),
		[],
	);

	const onEvent: ChangeEventHandler = async e => {
		const result = await postChangeEvent({
			noteId: id,
			changes: [{ data: e, created_at: getDateValueString() }],
			uploaded_at: '',
			sessionId,
		});
		const newNoteId = await result.data;
		if (newNoteId && newNoteId !== id) {
			router.push(`/editor/${newNoteId}`, undefined, {
				shallow: true,
			});
		}
	};

	const { markdown, height, hasFocus, processChange } = useEditableCanvas({
		ref: $_ref,
		cachedData,
		onDataChange,
		onEvent,
	});

	const [tab, setTab] = useState<'editor' | 'viewer'>('editor');
	const [socket, setSocket] = useState<Socket | undefined>();

	useEffect(() => {
		if (socket) {
			socket.disconnect();
		}

		const newSocket = io(socketServerUrl);
		setSocket(newSocket);

		newSocket.emit('join', id);

		newSocket.on('change', (message: StoredChanges) => {
			if (message.sessionId !== sessionId) {
				processChange(message);
			}
		});

		const _isOnline = () => router.replace(router.asPath);
		window.addEventListener('online', _isOnline);

		return () => {
			newSocket.disconnect();
			window.removeEventListener('online', _isOnline);
		};
	}, [id]);

	const href = `${process.env.NEXT_PUBLIC_URL_BASE}/editor/${id}`;

	return (
		<>
			<NextSeo
				title={title}
				noindex={id !== unsavedNoteId}
				description="Collaborative, realtime, Markdown editing"
				canonical={`${process.env.NEXT_PUBLIC_URL_BASE}/editor`}
			/>
			<div className="display-width">
				<h2 className="mb-12 text-3xl">{title}</h2>
				<p className="mb-4">
					As part of exploring my weaknesses as a programmer, I
					decided to take on the challenge of writing a text editor
					from scratch and exploring a Notion-style live editing data
					schema. Its a{' '}
					<a
						className="hover:underline text-brand"
						href="https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type"
					>
						semi-CRDT
					</a>
					.
				</p>
				<p className="mb-4">
					I know TypeScript and web development, so I wrote it from
					scratch using HTML Canvas.
				</p>
				<p>
					The core functionality works pretty well on desktop, though
					some of the spacing is non-perfect. Open the permanent link
					a new tab and see how well the collaboration performs ????
				</p>
			</div>
			<div className="w-full text-center display-width divider-before">
				<div>
					<h3 className="mb-4 text-xl">
						ID: {id === unsavedNoteId ? 'unsaved' : id}
					</h3>
					<p>
						Permament link:
						{id === unsavedNoteId ? (
							<span className="ml-4">tba</span>
						) : (
							<a
								href={href}
								target="_blank"
								rel="noreferrer"
								className="ml-4 hover:underline text-brand"
							>
								{href}
							</a>
						)}
					</p>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center display-width divider-before">
				<div className="flex items-center justify-center w-full mb-8">
					<h3
						onClick={() => setTab('editor')}
						className={`${
							tab === 'editor'
								? 'underline underline-offset-8 decoration-brand decoration-wavy'
								: ''
						} text-2xl mr-4 cursor-pointer`}
					>
						Editor
					</h3>
					<h3
						onClick={() => setTab('viewer')}
						className={`${
							tab === 'viewer'
								? 'underline underline-offset-8 decoration-brand decoration-wavy'
								: ''
						} text-2xl ml-4 cursor-pointer`}
					>
						Viewer
					</h3>
				</div>
				<div
					className={`w-full pb-16 mr-0 2xl:mr-4 2xl:pb-0 ${
						tab === 'editor' ? '' : 'hidden'
					}`}
				>
					<div
						className={`p-8 border-2 mt-2 w-full ${
							hasFocus ? 'border-brand' : ''
						}`}
					>
						<canvas
							ref={$_ref}
							height={height}
							width="auto"
							className="outline-none"
						/>
					</div>
				</div>
				{tab === 'viewer' && (
					<div className="w-full ml-0 2xl:ml-4">
						<MarkdownRenderer markdown={markdown} />
					</div>
				)}
			</div>
		</>
	);
}
