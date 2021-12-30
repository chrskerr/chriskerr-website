import { FirebaseChanges } from '../types/editor';
import { apiToken } from '../lib/constants';

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';

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

app.post('/editor', (req, res) => {
	if (req.headers.token !== apiToken) return res.status(500).end();

	const body = req.body as FirebaseChanges;
	io.to(body.note_id).emit('change', body);

	return res.status(200).end();
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
