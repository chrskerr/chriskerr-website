import { BlogData, BlogDataWithDates } from 'types/writing';
import { formatISO, format } from 'date-fns';

import { serialisingAsyncFunctions } from './20211119--serialising-async-functions';

const allBlobDataBySlug: Record<string, BlogData> = {
	'serialising-async-functions': serialisingAsyncFunctions,
};

const allWriting: BlogDataWithDates[] = Object.entries(allBlobDataBySlug)
	.sort(([, a], [, b]) => b.createdAt.valueOf() - a.createdAt.valueOf())
	.map<BlogDataWithDates>(([slug, { createdAt, modifiedAt, ...blog }]) => ({
		...blog,
		slug,
		publishedAtISO: formatISO(createdAt),
		modifiedAtISO: formatISO(modifiedAt),
		publishedAtString: format(createdAt, 'dd MMMM yyyy'),
		modifiedAtString: format(createdAt, 'dd MMMM yyyy'),
	}));

export default allWriting;
