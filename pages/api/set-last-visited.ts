import { NextApiHandler } from 'next';
import { cookieName, LastVisit } from 'pages/workout';

export type SetLastVisitedBody = {
	lastWeights: string;
	lastWod: string | null;
	lastFinisher: string | null;
};

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') {
		res.status(500).send('Method should be POST');
	}

	const body = req.body as SetLastVisitedBody;

	if (typeof body !== 'object') {
		res.status(500).send('Invalid body');
	}

	const existingCookieJson = req.cookies[cookieName];
	const parsedCookie = existingCookieJson
		? (JSON.parse(existingCookieJson) as LastVisit)
		: {};

	const cookie: LastVisit = {
		lastWeights: parsedCookie.lastWeights,
		lastWod: parsedCookie.lastWod ?? null,
		lastFinisher: parsedCookie.lastFinisher ?? null,
	};

	const keys: (keyof LastVisit)[] = [
		'lastWeights',
		'lastWod',
		'lastFinisher',
	];

	for (const key of keys) {
		const newData = body[key];
		if (!newData) continue;

		const existingData = cookie[key];

		if (Array.isArray(existingData)) {
			if (existingData[0] !== newData) {
				cookie[key] = [newData, ...existingData].slice(0, 10);
			}
		} else {
			cookie[key] = [newData];
		}
	}

	const expiry = new Date();
	expiry.setFullYear(expiry.getFullYear() + 1);

	res.setHeader('set-cookie', [
		`${cookieName}=${JSON.stringify(
			cookie,
		)}; expires=${expiry.toUTCString()}; path=/; httponly; samesite=lax;`,
	]);

	res.status(200).end();
};

export default handler;
