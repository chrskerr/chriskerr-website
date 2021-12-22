import BlogPost from "components/writing/blog";
import { GetStaticProps } from "next";
import { Blog, BlogPostSlugs, BlogPostTitles } from "types";

import { formatISO, format } from "date-fns";
import { marked } from "marked";
import hljs from "highlight.js";


export default function AsyncFunctionSerialiser ( props: Blog ) {
	return (
		<BlogPost blog={ props } />
	);
}

export const getStaticProps: GetStaticProps = () => {
	const createdAt = new Date( 2021, 11, 19 );
	const modifiedAt = new Date( 2021, 11, 19 );

	const htmlContent = marked.parse( markdown, {
		highlight: ( code, lang ) => {
			const language = hljs.getLanguage( lang ) ? lang : "plaintext";
			return hljs.highlight( code, { language }).value;
		},
		langPrefix: "hljs language-",
	});

	const props: Blog = {
		title: BlogPostTitles.ASYNC_FUNCTIONS,
		description: "How to create a serialised async function in Javascript / Typescript.",

		url: `${ process.env.NEXT_PUBLIC_URL_BASE }/${ BlogPostSlugs.ASYNC_FUNCTIONS }`,

		tags: [ "javascript", "typescript", "async", "serial", "queue" ],

		htmlContent,

		publishedAtISO: formatISO( createdAt ),
		modifiedAtISO: formatISO( modifiedAt ),
	
		publishedAtString: format( createdAt , "dd MMMM yyyy" ),
		modifiedAtString: format( modifiedAt, "dd MMMM yyyy" ),
	};

	return { props };
};

const markdown = `
So it turns out that I am way less versed in Javascript packages than I thought that I was, and didn't realise that [Aync](https://www.npmjs.com/package/async) existed...

So instead of using their queue function I created my own.

I needed to create a helper which would ensure that a function would only execute one-at-a-time to assist with time ordering of changes emitted by the my [editor](/editor/new). Changes are sorted server-side when saved to the database but this can only help live-subscribers if delivery is queued so that there is actually something to sort.

After all that, I published a wrapper which serialised my function (plus a bunch of other stuff, like data transforms), and wanted to share it with anyone who might benefit 🙂

An extended version of the below can be found at [Async Function Serializer](https://www.npmjs.com/package/async-function-serializer), but this was the core code!

\`\`\`ts
type Queue<T, R> = {
	resolve: ( data: R ) => void,
	input: T,
}[]

export function serialise<T, R>( 
	functionToSerialise: ( input: T ) => R, 
): (( input: T ) => Promise<R> ) {

	const queue: Queue<T, R> = [];
	let isRunning = false;

	async function run () {
		isRunning = true;

		const current = queue[ 0 ];
		const result = await functionToSerialise( current.input );
		current.resolve( result );

		queue.shift();
		
		if ( queue.length ) await run();

		isRunning = false;
	}

	return async function ( input: T ): Promise<R> {
		return await new Promise<R>( resolve => {
			queue.push({ resolve, input });
			if ( !isRunning ) run();
		});
	}; 
}
\`\`\`
`;