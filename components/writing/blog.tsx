
import { ReactElement, useMemo } from "react";
import Link from "next/link";
import Head from "next/head";

import { NextSeo, BlogJsonLd } from "next-seo";

import "highlight.js/styles/vs2015.css";

import type { Blog } from "types";

import { defaultTitle } from "pages/_app";

export interface BlogProps {
	blog: Blog,
	next?: {
		title: string;
		uid: string;
	},
	prev?: {
		title: string;
		uid: string;
	},
}

export default function BlogPost ({ blog, prev, next }: BlogProps ): ReactElement {
	const { title, description, url, tags, publishedAtISO, modifiedAtISO, htmlContent, publishedAtString } = blog;
	const trimmedTitle = title.slice( 0, 70 - defaultTitle.length - 3 ) || title;
	const prefetchData = useMemo(() => [ ...htmlContent.matchAll( /data-prefetch-href=\S+/g ) ], [ htmlContent ]);

	return ( <>
		<NextSeo 
			title={ trimmedTitle }
			description={ description }
			canonical={ url }
			openGraph={{
				type: "article",
				title: `${ trimmedTitle } - Chris Kerr`, url, description,
				article: { 
					tags, 
					publishedTime: publishedAtISO, 
					modifiedTime: modifiedAtISO,
					authors: [ "Chris Kerr" ],
				},
			}}
		/>
		<BlogJsonLd
			url={ url }
			title={ `${ trimmedTitle } - Chris Kerr` }
			images={[ `${ process.env.NEXT_PUBLIC_URL_BASE }/_next/image?url=%2Fimages%2Fme.jpeg&w=1200&q=75` ]}
			datePublished={ publishedAtISO }
			dateModified={ modifiedAtISO }
			authorName="Chris Kerr"
			description={ description }
		/>
		<Head>
			{ Array.isArray( prefetchData ) && prefetchData.map(([ data ], i ) => {
				if ( typeof data !== "string" ) return false; 

				return (
					<link 
						key={ i } 
						rel="prefetch" 
						href={ data.replace( "data-prefetch-href=\"", "" ).replace( "\"", "" ) } 
						as="document" 
					/>
				);
			})}
		</Head>
		<div className="flex flex-col items-center w-full">
			<h1 className="mb-6 text-2xl font-bold text-center sm:text-3xl display-width">{ title }</h1>
			<p className="text-lg text-center display-width narrower">{ description }</p>
			<div className="w-full prose divider-before" dangerouslySetInnerHTML={{ __html: htmlContent }} />
			<div className="flex flex-col flex-wrap items-end w-full mt-8 display-width">
				<p className="text-gray-600 sm:text-sm font-heading">Written: { publishedAtString }</p>
			</div>
			{ ( prev || next ) && <>
				<div className="flex justify-center display-width divider-before">
					<h3 className="mb-4 text-2xl text-brand-dark">More Posts</h3>
				</div>
				<div className={`display-width ${ ( next && prev ) ? "grid grid-cols-2" : "" }` }>
					{ prev && 
						<div className="flex justify-center p-4">
							<Link href={ `/${ prev.uid }` } passHref><a className="text-lg text-center underline hover:text-brand-dark">{ prev.title }</a></Link>
						</div> 
					}
					{ next && 
						<div className="flex justify-center p-4">
							<Link href={ `/${ next.uid }` } passHref><a className="text-lg text-center underline hover:text-brand-dark">{ next.title }</a></Link>
						</div> 
					}
				</div>
			</> }
		</div>
	</> );
}
