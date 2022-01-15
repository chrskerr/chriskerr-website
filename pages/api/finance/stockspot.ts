import { NextApiHandler } from 'next';
import NextCors from 'nextjs-cors';

import { confirmCookieAuth } from 'components/finance/helpers';
import { socketServerUrl } from 'lib/constants';

const apiKey = process.env.API_KEY;

const handler: NextApiHandler = async (req, res) => {
	await NextCors(req, res, {
		origin: process.env.NEXT_PUBLIC_URL_BASE,
		methods: ['POST'],
		credentials: true,
	});

	const isAuthed = confirmCookieAuth(req, res);
	const balance = req.body?.balance;

	if (!isAuthed || typeof balance !== 'number') {
		return res.status(500).end();
	}

	await fetch(socketServerUrl + '/up/report', {
		headers: apiKey
			? new Headers({
					api_key: apiKey,
					'content-type': 'application/json',
			  })
			: {},
		method: 'POST',
		body: JSON.stringify({ balance: balance * 100 }),
	});

	res.status(200).end();
};

export default handler;
