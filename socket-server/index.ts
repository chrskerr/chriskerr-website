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
// @ts-ignore
import KnexPostgres from 'knex/lib/dialects/postgres';

import { processAllChanges } from '../components/editable-canvas/helpers';
import { generateSlug, RandomWordOptions } from 'random-word-slugs';

import { unsavedNoteId } from '../lib/constants';

const corsSettings: CorsOptions = {
	origin: ['http://localhost:3000', 'https://www.chriskerr.com.au'],
	credentials: true,
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: corsSettings,
});

app.use(bodyParser.json());
app.use(cors(corsSettings));

enum TableNames {
	NOTES = 'notes',
}

interface INote {
	id: string;
	data: StoredNote;
}

const knex = Knex({
	client: KnexPostgres,
	connection: {
		connectionString:
			process.env.DATABASE_URL || 'postgres://127.0.0.1:5432/postgres',
		ssl: {
			rejectUnauthorized: false,
		},
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

app.post('/editor/:id', async (req, res) => {
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
});

app.get('/editor/:id', async (req, res) => {
	const noteId = req.params.id;

	if (!noteId) return res.status(500).end();

	const [noteData]: INote[] = await knex(TableNames.NOTES)
		.where({ id: noteId })
		.select('data')
		.limit(1);

	return res.status(200).json(noteData?.data);
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

(async () => {
	const hasNotesTable = await knex.schema.hasTable(TableNames.NOTES);
	if (!hasNotesTable) {
		await knex.schema.createTable(TableNames.NOTES, table => {
			table.text('id').unique().index();
			table.jsonb('data').notNullable();
		});
	}
})();
