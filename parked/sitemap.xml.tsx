
import { getAllBlogs } from "parked/fetch-data";
import { GetServerSideProps } from "next";

import { formatISO } from "date-fns";

import compact from "lodash/compact";
import max from "lodash/max";

import { longCacheSeconds } from "./_app";
import { lastmod as uncopyrightLastMod } from "./uncopyright";

const url_base = process.env.NEXT_PUBLIC_URL_BASE;

import NodeCache from "node-cache";
const cache = new NodeCache({
	useClones: false,
	stdTTL: longCacheSeconds,
});

const createSitemap = async (): Promise<string> => {
	const cache_key = "sitemap";

	const cachedXml = cache.get<string>( cache_key );
	if ( cachedXml ) {
		console.log( "sitemap served from cache" );
		return cachedXml;
	}
	
	const blogs = compact( await getAllBlogs() || []);

	const mostRecentModified = max( blogs.map(({ modifiedAtISO }) => modifiedAtISO )) || formatISO( new Date());

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${ url_base }</loc>
		<lastmod>${ mostRecentModified }</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.7</priority>
	</url>
	<url>
		<loc>${ url_base }/uncopyright</loc>
		<lastmod>${ uncopyrightLastMod }</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.1</priority>
	</url>
	${ blogs.length > 0 ? blogs.map(({ url, modifiedAtISO }) => {
		return `<url>
		<loc>${ url }</loc>
		<lastmod>${ modifiedAtISO }</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.5</priority>
	</url>`;
	}).join( "" ) : "" }
</urlset>`.trim();

	cache.set( cache_key, xml );
	return xml;

};

export default function SiteMap (): boolean {
	return false;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	res.setHeader( "Content-Type", "text/xml" );
	res.write( await createSitemap());
	res.end();

	return { props: {}};
};
