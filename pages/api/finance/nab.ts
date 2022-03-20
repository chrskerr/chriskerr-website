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

	if (!isAuthed) {
		return res.status(500).end();
	}

	const result = await fetch(socketServerUrl + '/nab/report', {
		headers: apiKey
			? new Headers({
					api_key: apiKey,
					'content-type': 'application/json',
			  })
			: {},
		method: 'POST',
		body: JSON.stringify(req.body),
	});

	if (result.ok) {
		res.status(200).end();
	} else {
		console.log('error', result);
		res.status(500).end();
	}
};

export default handler;
