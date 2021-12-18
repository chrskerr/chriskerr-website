

import { getAllBlogs, Blog } from "parked/fetch-data";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";

import orderBy from "lodash/orderBy";
import take from "lodash/take";
import compact from "lodash/compact";
import map from "lodash/map";
import lowerCase from "lodash/lowerCase";

import { shortCacheSeconds } from "pages/_app";

import NodeCache from "node-cache";
const cache = new NodeCache({
	useClones: false,
	stdTTL: shortCacheSeconds,
});

const cache_key = "data";

export interface SearchResult {
	/**
	 * The matching posts
	 */
	data: {
		slug: string,
		title: string,
		description: string,
		modifiedAtISO: string,
		relevance: number,
	}[],
}

export interface SearchBody {
	/**
	 * String of search terms
	 */
	terms: string,
}

interface SearchData extends Blog {
	relevance: number,
}

const handler: NextApiHandler = async ( req, res ) => {
	await NextCors( req, res, {
		origin: process.env.NEXT_PUBLIC_URL_BASE,
		methods: [ "GET" ],
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	});

	const body = req.body as SearchBody;
	const terms = body.terms;

	const cachedResults: SearchResult["data"] | undefined = cache.get( terms );

	if ( cachedResults ) {
		const result: SearchResult = {
			data: cachedResults,
		};
	
		return res.status( 200 ).send( result );
	}

	let data: SearchData[] | undefined = cache.get( cache_key );
	if ( !data ) {
		data = ( await getAllBlogs()).map( blog => {
			return {
				...blog,
				relevance: 0,
			};
		});
		cache.set( cache_key, data );
	}

	if ( !data || typeof terms !== "string"  ) return res.status( 500 ).send( "Something went wrong" );

	const splitTerms = lowerCase( terms ).split( " " );
	const termsCount = splitTerms.length;

	const matchedData = orderBy( 
		compact( 
			map( data, el => {
				const lowerCaseTitle = lowerCase( el.title );
				const lowerCaseDescription = lowerCase( el.description );
				const lowerCaseTextContent = lowerCase( el.textContent );
				const lowerCaseTags = el.tags.map( tag => lowerCase( tag ));

				const countMatches = splitTerms.reduce(( acc: number , term ) => {
					if ( lowerCaseTitle.includes( term )) return acc + 1;
					else if ( lowerCaseDescription.includes( term )) return acc + 1;
					else if ( lowerCaseTextContent.includes( term )) return acc + 1;
					else if ( lowerCaseTags.some( tag => tag.includes( term ))) return acc + 1;
					else return acc;
				}, 0 );

				const relevance = Math.round( Math.min( countMatches / termsCount, 1 ) * 100 );
				if ( relevance < 50 ) return false;

				const result: SearchData = {
					...el,
					relevance,
				};

				return result;
			}),
		), 
		[ "relevance", "modifiedAtISO" ], [ "desc", "desc" ],
	);

	const topFiveBlogs: SearchResult[ "data" ] = take( matchedData, 5 );

	cache.set( terms, topFiveBlogs );

	const result: SearchResult = {
		data: topFiveBlogs,
	};

	return res.status( 200 ).send( result );
};

export default handler;


