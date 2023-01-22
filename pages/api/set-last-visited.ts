import { NextApiHandler } from 'next';
import { cookieName, LastVisit } from 'pages/workout';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') {
		res.status(500).send('Method should be POST');
	}

	const body = req.body as LastVisit;

	if (typeof body !== 'object') {
		res.status(500).send('Invalid body');
	}

	const existingCookieJson = req.cookies[cookieName];
	const cookie = existingCookieJson
		? (JSON.parse(existingCookieJson) as LastVisit)
		: {};

	if (body.lastWeights) {
		cookie.lastWeights = body.lastWeights;
	}

	if (body.lastWod) {
		cookie.lastWod = body.lastWod;
	}

	if (body.lastFinisher) {
		cookie.lastFinisher = body.lastFinisher;
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
