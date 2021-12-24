export type ScrapingResults = {
	statusCode: number;
	hrefs: ProbablyValidUrl[];
};

export type ProbablyValidUrl = `https://${string}`;
