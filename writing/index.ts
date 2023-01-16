import { BlogData, BlogDataWithDates } from 'types/writing';
import { formatISO, format } from 'date-fns';

import { marked } from 'marked';
import hljs from 'highlight.js';

import { serialisingAsyncFunctions } from './20211119--serialising-async-functions';
import { triggeringYourself } from './20221128--triggering-yourself';
// import { knexMigrations } from './20221129--knex-migrations';

const allBlobDataBySlug: Record<string, BlogData> = {
	'serialising-async-functions': serialisingAsyncFunctions,
	'triggering-yourself': triggeringYourself,
	// 'knex-migrations': knexMigrations,
};

const allWriting: BlogDataWithDates[] = Object.entries(allBlobDataBySlug)
	.sort(([, a], [, b]) => b.createdAt.valueOf() - a.createdAt.valueOf())
	.map<BlogDataWithDates>(
		([slug, { createdAt, modifiedAt, markdown, ...blog }]) => ({
			...blog,
			slug,
			publishedAtISO: formatISO(createdAt),
			modifiedAtISO: formatISO(modifiedAt),

			publishedAtString: format(createdAt, 'dd MMMM yyyy'),
			modifiedAtString: format(createdAt, 'dd MMMM yyyy'),

			shortPublishedAtString: format(createdAt, 'dd MMM yyyy'),

			htmlContent: marked.parse(markdown, {
				highlight: (code, lang) => {
					const language = hljs.getLanguage(lang)
						? lang
						: 'plaintext';
					return hljs.highlight(code, { language }).value;
				},
				langPrefix: 'hljs language-',
			}),
		}),
	);

export default allWriting;
