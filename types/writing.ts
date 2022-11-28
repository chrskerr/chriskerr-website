export interface BlogData {
	title: string;
	description: string;

	tags: string[];
	markdown: string;

	createdAt: Date;
	modifiedAt: Date;
}

export interface BlogDataWithDates
	extends Omit<BlogData, 'createdAt' | 'modifiedAt'> {
	slug: string;

	publishedAtISO: string;
	modifiedAtISO: string;

	publishedAtString: string;
	modifiedAtString: string;

	shortPublishedAtString: string;
}

export interface Blog extends Omit<BlogDataWithDates, 'markdown'> {
	htmlContent: string;
	url: string;
}
