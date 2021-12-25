import type {
	ProbablyValidUrl,
	ScraperOptions,
	ScrapingResults,
} from './types';
import { ignoredDomains } from './constants';
import { findHrefs } from './helpers';

export default async function scraper(
	url: ProbablyValidUrl,
	options?: ScraperOptions,
): Promise<ScrapingResults> {
	if (
		options?.filter !== false &&
		ignoredDomains.some(domain => url.includes(domain))
	) {
		return {
			statusCode: 200,
			hrefs: [],
		};
	}
	const fetchRes = await fetch(url);
	let hrefs: ProbablyValidUrl[] = [];

	if (fetchRes.ok) {
		const contentType = fetchRes.headers.get('content-type');

		if (contentType?.includes('text/html')) {
			const html = await fetchRes.text();
			hrefs = findHrefs(html);
		}
	}

	return {
		statusCode: fetchRes.status,
		hrefs,
	};
}

export type { ProbablyValidUrl, ScrapingResults };
