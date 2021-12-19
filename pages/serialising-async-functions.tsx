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
To be written...

\`\`\`ts
type Queue<T, R> = {
	resolve: ( data: R ) => void,
	input: T,
}[]

type Options<T> = {
	sortByKey?: keyof T,
}

export function serialise<T, R>( 
	functionToSerialise: ( input: T ) => R, 
	options?: Options<T>,
): (( input: T ) => Promise<R> ) {
	let queue: Queue<T, R> = [];
	let isRunning = false;

	async function run () {
		isRunning = true;

		const result = await functionToSerialise( queue[ 0 ].input );
		queue[ 0 ].resolve( result );
		
		queue.shift();
		
		if ( queue.length ) await run();

		isRunning = false;
	}

	return async function ( input: T ): Promise<R> {
		return await new Promise<R>( resolve => {
			
			const item = { resolve, input };

			if ( options?.sortByKey ) {
				const key = options.sortByKey;
				queue = [ ...queue, item ]
					.sort(( a, b ) => Number( a.input[ key ]) - Number( b.input[ key ]));

			} else {
				queue.push( item );

			}

			if ( !isRunning ) run();
		});
	}; 
}
\`\`\`
`;