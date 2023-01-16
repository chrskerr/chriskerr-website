import { NextApiHandler } from 'next';
import { cookieName, LastVisit } from 'pages/workout';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') {
		res.status(500).send('Method should be POST');
	}

	const body = req.body as LastVisit;

	if (typeof body === 'object' && body.lastWeights && body.lastWod) {
		const newCookie: LastVisit = {
			lastWeights: body.lastWeights,
			lastWod: body.lastWod,
		};

		const expiry = new Date();
		expiry.setFullYear(expiry.getFullYear() + 1);

		res.setHeader(
			'set-cookie',
			`${cookieName}=${JSON.stringify(
				newCookie,
			)}; expires=${expiry.toUTCString()}; path=/; httponly; samesite=lax;`,
		);
	}

	res.status(200).end();
};

export default handler;
