import { NextApiHandler } from 'next';
import NextCors from 'nextjs-cors';

import { fetchTransactionsHelper } from 'components/finance/helpers';

const handler: NextApiHandler = async (req, res) => {
	await NextCors(req, res, {
		origin: process.env.NEXT_PUBLIC_URL_BASE,
		methods: ['GET'],
		credentials: true,
	});

	const period = req.query.period;

	const result = await fetchTransactionsHelper(
		req,
		res,
		Array.isArray(period) ? period[0] : period,
	);

	if (result) {
		res.status(200).json(result);
	}

	res.status(500).end();
};

export default handler;