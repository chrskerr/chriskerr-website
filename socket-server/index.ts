import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import {
	UpdateNoteAPIBody,
	UpdateNoteAPIResponse,
	StoredNote,
} from '../types/editor';

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';

import { PrismaClient } from '@prisma/client';

import { processAllChanges } from '../components/editable-canvas/helpers';
import { generateSlug, RandomWordOptions } from 'random-word-slugs';

import { unsavedNoteId } from '../lib/constants';

const corsSettings: CorsOptions = {
	origin: [
		'http://localhost:3000',
		'https://www.chriskerr.dev',
		'https://www.chriskerr.com.au',
	],
	credentials: true,
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: corsSettings,
});

declare module 'http' {
	interface IncomingMessage {
		rawBody: Buffer;
	}
}

app.use(
	bodyParser.json({
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	}),
);
app.use(cors(corsSettings));

interface INote {
	id: string;
	data: StoredNote;
}

const db = new PrismaClient();

const idLength = 3;
const idOptions: RandomWordOptions<typeof idLength> = {
	format: 'kebab',
	partsOfSpeech: ['adjective', 'adjective', 'noun'],
	categories: {
		noun: ['animals', 'food', 'place', 'science', 'technology'],
	},
};

const getId = () => generateSlug(idLength, idOptions);

const createNewId = async (): Promise<string> => {
	try {
		const id = getId();

		const newNote = await db.note.create({
			data: { id, data: { cells: [] } },
			select: { id: true },
		});

		if (newNote?.id === id) return id;
		throw new Error();
	} catch (e) {
		console.log(e);
		return createNewId();
	}
};

app.post('/editor/:id', async (req, res, next) => {
	try {
		let noteId = req.params.id;

		if (!noteId) return res.status(500).end();
		const body = req.body as UpdateNoteAPIBody;

		if (noteId === unsavedNoteId) {
			noteId = await createNewId();
		}

		io.to(noteId).emit('change', body);

		const responseData: UpdateNoteAPIResponse = { noteId };
		res.status(200).json(responseData);

		db.$transaction(async trx => {
			const currentData = await trx.note.findFirst({
				where: { id: noteId },
				select: { data: true },
			});

			if (!currentData?.data) return;
			const data = currentData.data as unknown as INote['data'];

			const updatedData = processAllChanges(
				[{ ...body, applied_to_note: false, note_id: noteId }],
				{
					id: noteId,
					cells: data.cells,
				},
			);

			await trx.note.update({
				where: { id: noteId },
				data: { data: updatedData },
			});
		});
	} catch (e) {
		next(e);
	}
});

app.get('/editor/:id', async (req, res, next) => {
	try {
		const noteId = req.params.id;

		if (!noteId) return res.status(500).end();

		const noteData = await db.note.findFirst({
			where: { id: noteId },
			select: { data: true },
		});

		return res.status(200).json(noteData?.data);
	} catch (e) {
		next(e);
	}
});

io.on('connection', socket => {
	socket.on('join', room => {
		socket.join(room);
	});
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
	console.log(`listening on *:${port}`);
});
