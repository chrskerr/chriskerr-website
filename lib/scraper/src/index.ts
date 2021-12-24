export type ScrapingResults = {
	statusCode: number;
	hrefs: ProbablyValidUrl[];
};

export type ProbablyValidUrl = `https://${string}`;

import { ignoredDomains } from './constants';
import { findHrefs } from './helpers';

export default async function scraper(
	url: ProbablyValidUrl,
): Promise<ScrapingResults> {
	const fetchRes = await fetch(url);
	let hrefs: ProbablyValidUrl[] = [];

	if (fetchRes.ok) {
		const contentType = fetchRes.headers.get('content-type');

		if (contentType?.includes('text/html')) {
			const html = await fetchRes.text();
			hrefs = ignoredDomains.some(domain => url.includes(domain))
				? []
				: findHrefs(html);
		}
	}

	return {
		statusCode: fetchRes.status,
		hrefs,
	};
}
