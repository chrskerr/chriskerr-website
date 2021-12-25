export type ScrapingResults = {
	statusCode: number;
	hrefs: ProbablyValidUrl[];
};

export type ProbablyValidUrl = `https://${string}`;

export type ScraperOptions = {
	filter?: boolean;
};
