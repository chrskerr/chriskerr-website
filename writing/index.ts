import { BlogData, BlogDataWithDates } from 'types/writing';
import { formatISO, format } from 'date-fns';

import { serialisingAsyncFunctions } from './20211119--serialising-async-functions';
import { triggeringYourself } from './20221128--triggering-yourself';

const allBlobDataBySlug: Record<string, BlogData> = {
	'serialising-async-functions': serialisingAsyncFunctions,
	'triggering-yourself': triggeringYourself,
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

		shortPublishedAtString: format(createdAt, 'dd MMM yyyy'),
	}));

export default allWriting;
