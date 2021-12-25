import scraper, { ProbablyValidUrl, ScrapingResults } from 'lib/scraper/src';
import { NextApiHandler } from 'next';
import NextCors from 'nextjs-cors';

export type ScraperAPIBody = {
	url: ProbablyValidUrl;
};

export type ScraperAPIResponse = ScrapingResults;

const handler: NextApiHandler = async (req, res) => {
	await NextCors(req, res, {
		origin: process.env.NEXT_PUBLIC_URL_BASE,
		methods: ['POST'],
	});

	const { url } = req.body as ScraperAPIBody;
	if (typeof url !== 'string' || !url.startsWith('https://')) {
		return res.status(500).send('Invalid url');
	}

	const result: ScraperAPIResponse = await scraper(url, { filter: false });
	res.status(200).json(result);
};

export default handler;
