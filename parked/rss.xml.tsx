
import { getAllBlogs } from "parked/fetch-data";
import { GetServerSideProps } from "next";
import compact from "lodash/compact";
import take from "lodash/take";
import { description } from "components/view/landing";
import { longCacheSeconds, defaultTitle } from "./_app";

const url_base = process.env.NEXT_PUBLIC_URL_BASE;

import NodeCache from "node-cache";
const cache = new NodeCache({
	useClones: false,
	stdTTL: longCacheSeconds,
});
// 6 hours cache

const createRss = async (): Promise<string> => {
	const cache_key = "rss";

	const cachedXml = cache.get<string>( cache_key );
	if ( cachedXml ) {
		console.log( "RSS served from cache" );
		return cachedXml;
	}

	const blogs = compact( await getAllBlogs());

	const xml = `<?xml version="1.0" encoding="UTF-8" ?>
	<rss version="2.0">
	
	<channel>
	  <title>${ defaultTitle }</title>
	  <link>${ url_base }</link>
	  <language>en-au</language>
	  <description>${ description }</description>
	  ${ ( blogs && blogs.length > 0 ) ? take( blogs, 10 ).map(({ title, url, description }) => {
		return `<item>
		<title>${ title }</title>
		<link>${ url }</link>
		<description>${ description }</description>
	  </item>`;
	}).join( "" ) : "" }
	</channel>
	
	</rss>`.trim();

	cache.set( cache_key, xml );
	return xml;
};

export default function SiteMap (): boolean {
	return false;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	res.setHeader( "Content-Type", "text/xml" );
	res.write( await createRss());
	res.end();

	return { props: {}};
};
