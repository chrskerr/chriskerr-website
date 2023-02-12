import { allRunning, allWeights } from 'lib/fit-pickle';
import { NextApiHandler } from 'next';
import { LastPickleVisit, cookieName } from 'pages/fit-pickle/[mode]';

export type SetLastVisitedBody = {
	lastWeights: string;
	lastRunning: string | null;
};

const keys: (keyof LastPickleVisit)[] = ['lastWeights', 'lastRunning'];
const maxLengths: Record<keyof LastPickleVisit, number> = {
	lastRunning: allRunning.length,
	lastWeights: allWeights.length,
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
		? (JSON.parse(existingCookieJson) as LastPickleVisit)
		: {};

	const cookie: LastPickleVisit = {
		lastWeights: parsedCookie.lastWeights,
		lastRunning: parsedCookie.lastRunning ?? null,
	};

	for (const key of keys) {
		const newData = body[key];
		if (!newData) continue;

		const existingData = cookie[key];

		if (Array.isArray(existingData)) {
			if (existingData[0] !== newData) {
				cookie[key] = [newData, ...existingData].slice(
					0,
					maxLengths[key],
				);
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
