import { socketServerUrl } from 'lib/constants';
import { ProbablyValidUrl, ScrapingResults } from 'lib/scraper/src';
import {
	GetServerSidePropsContext,
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
} from 'next';
import NextCors from 'nextjs-cors';
import Cookies from 'cookies';
import { UpApiReturn } from 'types/finance';

export type ScraperAPIBody = {
	url: ProbablyValidUrl;
};

export type ScraperAPIResponse = ScrapingResults;

const apiKey = process.env.API_KEY;

const cookieName = 'hasAccess';
const cookieTrue = 'yes';
const cookieKey = process.env.COOKIE_KEY;
const cookieSetSettings: Cookies.SetOption = {
	signed: true,
	httpOnly: true,
	maxAge: 10 * 24 * 60 * 60 * 1000,
	sameSite: 'strict',
};

const handler: NextApiHandler = async (req, res) => {
	await NextCors(req, res, {
		origin: process.env.NEXT_PUBLIC_URL_BASE,
		methods: ['GET'],
		credentials: true,
	});

	const result = await fetchTransactionsHelper(req, res);

	if (result) {
		res.status(200).json(result);
	}

	res.status(500).end();
};

export default handler;

export const fetchTransactionsHelper = async (
	req: NextApiRequest | GetServerSidePropsContext['req'],
	res: NextApiResponse | GetServerSidePropsContext['res'],
): Promise<UpApiReturn | null> => {
	const headersApiKey = req.headers['api_key'];

	const cookies = cookieKey && new Cookies(req, res, { keys: [cookieKey] });

	const authCookie =
		!!cookies && cookies.get(cookieName, { signed: true }) === cookieTrue;

	const hasAuth = authCookie || (!!apiKey && headersApiKey === apiKey);

	if (hasAuth) {
		const response = await fetch(socketServerUrl + '/up/week', {
			headers: apiKey ? new Headers({ api_key: apiKey }) : {},
		});

		if (response.ok) {
			const data = (await response.json()) as UpApiReturn;
			cookies && cookies.set(cookieName, cookieTrue, cookieSetSettings);

			return data;
		}
	} else {
		cookies && cookies.set(cookieName, 'no', cookieSetSettings);
	}

	return null;
};
