import type { ProbablyValidUrl } from './types';

export const findHrefs = (html: string): ProbablyValidUrl[] => {
	const aTags = html.match(/<a[^>]+>/g);
	if (!aTags) return [];

	return aTags.reduce<ProbablyValidUrl[]>((acc, curr) => {
		const urlArray = curr.match(/href=["'](https:\/\/[^"'?]+)["'?]/);
		const href = urlArray ? urlArray[1] : undefined;
		if (!href || !isValidUrl(href) || acc.includes(href)) return acc;
		return [...acc, href];
	}, []);
};

export const isValidUrl = (
	url: string | undefined,
): url is ProbablyValidUrl => {
	return url ? url.startsWith('https://') : false;
};
