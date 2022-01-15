import {
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse,
} from 'next';

import { UpApiReturn } from 'types/finance';
import { socketServerUrl } from 'lib/constants';

import Cookies from 'cookies';

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

export const confirmCookieAuth = (
	req: NextApiRequest | GetServerSidePropsContext['req'],
	res: NextApiResponse | GetServerSidePropsContext['res'],
): boolean => {
	const cookies = cookieKey && new Cookies(req, res, { keys: [cookieKey] });
	return (
		!!cookies && cookies.get(cookieName, { signed: true }) === cookieTrue
	);
};

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
