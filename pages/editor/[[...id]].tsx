import { EditableCanvasData, StoredNote } from 'types/editor';
import { socketServerUrl, unsavedNoteId } from 'lib/constants';

import type { GetServerSideProps } from 'next';

import Editor from 'components/editable-canvas';

interface EditorProps {
	id: string;
	initialData: EditableCanvasData;
}

export default function EditorRoute(props: EditorProps) {
	return <Editor {...props} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
	const id = Array.isArray(context.query.id)
		? context.query.id[0]
		: context.query.id;

	if (Array.isArray(context.query.id) && context.query.id.length > 1) {
		return {
			redirect: {
				destination: context.query.id[0],
				permanent: false,
			},
		};
	}

	if (!id) {
		const props: EditorProps = {
			initialData: { id: unsavedNoteId, cells: [] },
			id: unsavedNoteId,
		};

		return {
			props,
		};
	}

	const res = await fetch(`${socketServerUrl}/editor/${id}`);
	if (!res.ok)
		return {
			redirect: {
				permanent: false,
				destination: '/editor',
			},
		};

	const data = (await res.json()) as StoredNote;

	const props: EditorProps = {
		initialData: { id, cells: data.cells },
		id,
	};

	return {
		props,
	};
};
