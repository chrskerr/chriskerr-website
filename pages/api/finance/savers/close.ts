import { NextApiHandler } from 'next';
import NextCors from 'nextjs-cors';

import { confirmCookieAuth } from 'components/finance/helpers';
import { ISaversCloseBody } from 'types/finance';
import { socketServerUrl } from 'lib/constants';

const apiKey = process.env.API_KEY;

const handler: NextApiHandler = async (req, res) => {
	await NextCors(req, res, {
		origin: process.env.NEXT_PUBLIC_URL_BASE,
		methods: ['POST'],
		credentials: true,
	});

	const isAuthed = confirmCookieAuth(req, res);

	if (!isAuthed) {
		return res.status(500).end();
	}

	const body: ISaversCloseBody = req.body;

	const result = await fetch(socketServerUrl + '/savers/close', {
		headers: apiKey
			? new Headers({
					api_key: apiKey,
					'content-type': 'application/json',
			  })
			: {},
		method: 'POST',
		body: JSON.stringify(body),
	});

	if (result.ok) {
		res.status(200).end();
	} else {
		const error = await result.json();

		console.log('error', error);
		res.status(500).send(error);
	}
};

export default handler;
