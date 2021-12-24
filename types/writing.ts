interface CoreBlog {
	slug: string;

	title: string;
	description: string;

	tags: string[];

	publishedAtISO: string;
	modifiedAtISO: string;

	publishedAtString: string;
	modifiedAtString: string;
}

export interface BlogData extends CoreBlog {
	markdown: string;
}

export interface Blog extends CoreBlog {
	htmlContent: string;
	url: string;
}

export enum BlogPostSlugs {
	ASYNC_FUNCTIONS = 'serialising-async-functions',
}

export enum BlogPostTitles {
	ASYNC_FUNCTIONS = 'Serialising Async Functions',
}
