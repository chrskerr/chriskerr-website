import { NextApiHandler } from 'next';
import { LastPickleVisit, cookieName } from 'pages/fit-pickle/[mode]';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') {
		res.status(500).send('Method should be POST');
	}

	const body = req.body as LastPickleVisit;
	if (typeof body !== 'object') {
		res.status(500).send('Invalid body');
	}

	const existingCookieJson = req.cookies[cookieName];
	const cookie = existingCookieJson
		? (JSON.parse(existingCookieJson) as LastPickleVisit)
		: {};

	if (body.lastWeights) {
		cookie.lastWeights = body.lastWeights;
	}

	if (body.lastRunning) {
		cookie.lastRunning = body.lastRunning;
	}

	const expiry = new Date();
	expiry.setFullYear(expiry.getFullYear() + 1);

	res.setHeader(
		'set-cookie',
		`${cookieName}=${JSON.stringify(
			cookie,
		)}; expires=${expiry.toUTCString()}; path=/; httponly; samesite=lax;`,
	);

	res.status(200).end();
};

export default handler;
