
import { format, formatISO, parseISO } from "date-fns";
import { AllBlogsQuery, AllBlogsQueryVariables, OneBlogQuery, OneBlogQueryVariables, ChrisWriting, Maybe, GetNextPreviousBlogQuery, GetNextPreviousBlogQueryVariables } from "types/prismic-graphql";

import compact from "lodash/compact";
import orderBy from "lodash/orderBy";

import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { HttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { createPersistedQueryLink } from "apollo-link-persisted-queries";

import Prismic from "@prismicio/client";
import prismicDOM, { HTMLSerializer } from "prismic-dom";
import sanitizeHtml from "sanitize-html";
import { decode } from "entities";
import hljs from "highlight.js";

import fs from "fs";

export type Blog = {
	slug: string,
	id: string,
	url: string,

	title: string,
	description: string,

	htmlContent: string,
	textContent: string,

	tags: string[],

	publishedAtISO: string,
	modifiedAtISO: string,

	publishedAtString: string,
	modifiedAtString: string,
}

const blogDataFragment = gql`
	fragment BlogData on ChrisWriting {
		title, content, short_description
		_meta {
			id, uid, firstPublicationDate, lastPublicationDate, tags, lang, type,
			alternateLanguages {
				id, lang, type
			}
		}
	}
`;

const allBlogsQuery = gql`
	query AllBlogs ( $first: Int ) {
		allChrisWritings ( sortBy: meta_firstPublicationDate_DESC, first: $first ) {
			edges {
				node { ...BlogData }
				cursor
			}
		}
	}
	${ blogDataFragment }
`;

const oneBlogQuery = gql`
	query OneBlog ( $uid: String! ) {
		chrisWriting ( uid: $uid, lang: "en-au" ) {
			...BlogData
		}
	}
	${ blogDataFragment }
`; 

const getNextPreviousBlogQuery = gql`
	query GetNextPreviousBlog ( $firstPublicationDate: DateTime! ) {
		edgeAfter: allChrisWritings (
			firstPublicationDate_after: $firstPublicationDate, 
			sortBy: meta_firstPublicationDate_ASC, 
			first: 1 
		) {
			edges {
				node { ...BlogData }
				cursor
			}
		},
  		edgeBefore: allChrisWritings (
			  firstPublicationDate_before: $firstPublicationDate, 
			  sortBy: meta_firstPublicationDate_DESC, 
			  first: 1 
			) {
			edges {
				node { ...BlogData }
				cursor
			}
		}
	}
	${ blogDataFragment }
`;

export const getAllBlogs = async ( limit?: number, ref?: string ): Promise<Blog[]> => {
	const client = new ApolloClient({
		link: createPersistedQueryLink().concat( PrismicLink({
			repositoryName: process.env.PRISMIC_REPOSITORY_NAME || "",
			accessToken: process.env.PRISMIC_ENDPOINT_TOKEN || "",
			...( ref && { ref }),
		})),
		cache: new InMemoryCache(),
	});
	
	const variables: AllBlogsQueryVariables = { first: limit };
	const { data } = await client.query<AllBlogsQuery>({ query: allBlogsQuery, variables });
  
	const cleanedEdges = compact(( data?.allChrisWritings?.edges || []).map( edge => edge && prepareData( edge.node )));
	return orderBy( cleanedEdges, [ "publishedAtISO" ], [ "desc" ]);
};

interface GetBlog {
	curr: Maybe<Blog>,
	next: Maybe<{
		title: string,
		uid: string,
	}>,
	prev: Maybe<{
		title: string,
		uid: string,
	}>,
}

export const getBlog = async ( uid: string, ref?: string ): Promise<Maybe<GetBlog>> => {
	try {
		const client = new ApolloClient({
			link: createPersistedQueryLink().concat( PrismicLink({
				repositoryName: process.env.PRISMIC_REPOSITORY_NAME || "",
				accessToken: process.env.PRISMIC_ENDPOINT_TOKEN || "",
				...( ref && { ref }),
			})),
			cache: new InMemoryCache(),
		});

		const variables: OneBlogQueryVariables = { uid };
		const { data } = await client.query<OneBlogQuery>({ query: oneBlogQuery, variables });
		if ( !data || !data.chrisWriting ) return null;

		const firstPublicationDate = data.chrisWriting._meta.firstPublicationDate;
		const nextPreviousVariables: GetNextPreviousBlogQueryVariables = { firstPublicationDate };
		const nextPreviousData = firstPublicationDate ? await client.query<GetNextPreviousBlogQuery>({ query: getNextPreviousBlogQuery, variables: nextPreviousVariables }) : undefined;

		const nextEdge = nextPreviousData?.data?.edgeAfter?.edges ? nextPreviousData.data.edgeAfter.edges[ 0 ]?.node : undefined;
		const prevEdge = nextPreviousData?.data?.edgeBefore?.edges ? nextPreviousData.data.edgeBefore.edges[ 0 ]?.node : undefined;

		return {
			curr: prepareData( data.chrisWriting ),
			next: ( nextEdge?.title && nextEdge._meta.uid ) ? {
				title: nextEdge.title,
				uid: nextEdge._meta.uid,
			} : null,
			prev: ( prevEdge?.title && prevEdge._meta.uid ) ? {
				title: prevEdge.title,
				uid: prevEdge._meta.uid,
			} : null,
		};

	} catch ( e ) {
		console.error( e );
		return null;
		
	}
};


const prepareData = ( node: ChrisWriting ): Maybe<Blog> => {
	const { _meta, title, short_description, content } = node;
	if ( !_meta || typeof _meta !== "object" || !title || !short_description || !content ) return null;

	const { uid, id, tags, lastPublicationDate, firstPublicationDate } = _meta;
	if ( !uid || !id ) return null;

	// @ts-ignore
	const htmlSerialiser: typeof HTMLSerializer = ( type, element, content, children ) => {
		if ( type === "hyperlink" && element?.data?.slug ) {
			const href = `/${ element.data.slug }`;
			return `<a data-prefetch-href="${ href }" href="${ href }">${ content }</a>`;
		}
		else if ( element.label?.startsWith( "language" )) {
			return `<pre><code>${ hljs.highlight(
				decode( children.join( "" ).replace( /<br \/>/g, "\n" )),
				{ language: element.label.replace( "language-", "" ) },
			).value }</code></pre>`;
		}

		return null;
	};

	const htmlContent = sanitizeHtml(
		prismicDOM.RichText.asHtml( content, undefined, htmlSerialiser ),
		{ 
			allowedClasses: { "*": [ "*" ]},
			allowedTags: sanitizeHtml.defaults.allowedTags.concat([ "img" ]),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				img: [ "src", "alt", "width", "height", "sizes", "srcset" ],
				a: [ ...sanitizeHtml.defaults.allowedAttributes.a, "data-prefetch-href" ],
			},
		},
	);

	fs.writeFileSync( 
		`saved_html/${ uid }`, 
		`
		uid: ${ uid }
		title: ${ title }
		description: ${ short_description }
		first_publication: ${ formatISO( parseISO( firstPublicationDate )) }
		html: ${ htmlContent }
		`, 
		{ encoding: "utf-8" },
	);

	const textContent = prismicDOM.RichText.asText( content );

	const result: Blog = {
		slug: uid,
		id,
		url: `${ process.env.NEXT_PUBLIC_URL_BASE }/${ uid }`,
	
		title,
		description: short_description,
	
		htmlContent,
		textContent,
	
		tags,
	
		publishedAtISO: firstPublicationDate ? formatISO( parseISO( firstPublicationDate )) : "preview",
		modifiedAtISO: lastPublicationDate ? formatISO( parseISO( lastPublicationDate )) : "preview",
	
		publishedAtString: firstPublicationDate ? format( parseISO( firstPublicationDate ), "dd MMMM yyyy" ) : "preview",
		modifiedAtString: lastPublicationDate ? format( parseISO( lastPublicationDate ), "dd MMMM yyyy" ) : "preview",
	};
	

	return result;
};

function PrismicLink({ accessToken, repositoryName, ref }: { accessToken: string, repositoryName: string, ref?: string }) { 
	const gqlEndpoint = `https://${repositoryName}.cdn.prismic.io/graphql`;
	const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api`;
  
	const prismicClient = Prismic.client( apiEndpoint, { accessToken });
  
	const prismicLink = setContext(
		( request, previousContext ) => {
			return prismicClient
				.getApi()
				.then(
					( api ) => {
						return ({
							headers: {
								"Prismic-ref": ref || api.masterRef.ref,
								...previousContext.headers,
								// @ts-ignore
								...( api.integrationFieldsRef ? { "Prismic-integration-field-ref" : api.integrationFieldsRef } : {}),
								...( accessToken ? { Authorization: `Token ${accessToken}` } : {}),
							},
						});},
				);
		});

	const httpLink = new HttpLink({
		uri: gqlEndpoint,
		useGETForQueries: true,
		fetch: ( url: string, options ) => {
			const trimmed = removeWhiteSpace( url );
			return fetch( trimmed, options );
		},
	});

	return prismicLink.concat( httpLink );
}

function removeWhiteSpace( str: string ) {
	const regexp = /(%0A|%20)*(%20|%7B|%7D)(%0A|%20)*/g;

	const [ path, query ] = str.split( "?" );
	if( !query ) return str;

	const shortQuery = query.split( "&" ).map(( param ) => {
		const [ name, value ] = param.split( "=" );
		if ( name === "query" ) {
			return name + "=" + value.replace( regexp, ( chars, spaces, brackets ) => brackets );
		}
		return param;
	}).join( "&" );

	return [ path, shortQuery ].join( "?" );
}
