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

import Knex from 'knex';

import { processAllChanges } from '../components/editable-canvas/helpers';
import { generateSlug, RandomWordOptions } from 'random-word-slugs';

import { unsavedNoteId } from '../lib/constants';

import {
	createUpFetchRoutes,
	createUpUpdateRoutes,
	// createUpAdminRoutes,
} from './up/routes';
import { migrate, TableNames } from './migrations';

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

const knex = Knex({
	client: 'pg',
	connection: {
		connectionString:
			process.env.DATABASE_URL || 'postgres://127.0.0.1:5432/postgres',
		...(process.env.DATABASE_URL && {
			ssl: {
				rejectUnauthorized: false,
			},
		}),
	},
});

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

		const insertData: INote = { id, data: { cells: [] } };

		const newNote = await knex(TableNames.NOTES)
			.insert(insertData)
			.returning('id');

		if (newNote && newNote[0] === id) return id;
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

		knex.transaction(async trx => {
			const [currentData]: INote[] = await knex(TableNames.NOTES)
				.transacting(trx)
				.where({ id: noteId })
				.select('data')
				.limit(1)
				.forUpdate();

			if (!currentData) return;

			const updatedData = processAllChanges(
				[{ ...body, applied_to_note: false, note_id: noteId }],
				{
					id: noteId,
					cells: currentData.data.cells,
				},
			);

			const updateData: Partial<INote> = {
				data: updatedData,
			};

			await knex(TableNames.NOTES)
				.transacting(trx)
				.where({ id: noteId })
				.update(updateData);
		});
	} catch (e) {
		next(e);
	}
});

app.get('/editor/:id', async (req, res, next) => {
	try {
		const noteId = req.params.id;

		if (!noteId) return res.status(500).end();

		const [noteData]: INote[] = await knex(TableNames.NOTES)
			.where({ id: noteId })
			.select('data')
			.limit(1);

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

app.set('trust proxy', 1);
createUpFetchRoutes(app, knex);
createUpUpdateRoutes(app, knex);
// createUpAdminRoutes(app);

const port = process.env.PORT || 8080;
server.listen(port, () => {
	console.log(`listening on *:${port}`);
});

migrate(knex);
