
import { ReactElement } from "react";
import { GetStaticPaths, GetStaticProps } from "next";

import slice from "lodash/slice";
import compact from "lodash/compact";

import { getAllBlogs, getBlog } from "parked/fetch-data";
import { shortCacheSeconds, longCacheSeconds } from "../pages/_app";

import BlogPost, { BlogProps } from "components/view/blog";
import Landing, { LandingProps } from "components/view/landing";
import { differenceInMonths, parseISO } from "date-fns";

interface PageProps {
	type: "blog" | "landing",
	props: BlogProps | LandingProps
}

interface BlogPageProps {
	type: "blog",
	props: BlogProps,
}

interface LandingPageProps {
	type: "landing",
	props: LandingProps,
}

const postsPerPage = 5;

function Page ({ type, props }: LandingPageProps ): ReactElement
function Page ({ type, props }: BlogPageProps ): ReactElement
function Page ({ type, props }: PageProps ): ReactElement {	
	return type === "blog" ? 
		<BlogPost { ...props as BlogProps } /> :
		<Landing { ...props as LandingProps } />;
}

export default Page;

export const getStaticProps: GetStaticProps = async ({ params, preview, previewData }) => {
	const slug = Array.isArray( params?.page ) ? params?.page[ 0 ] : params?.page;

	let props: PageProps, revalidate = longCacheSeconds;

	if ( slug && Number( slug )%1 !== 0  ) {
		const blogsPreviewData = previewData as { ref: string };
		const previewRef = blogsPreviewData?.ref;

		const data = await getBlog( slug, ( preview && previewRef ) ? previewRef : undefined ); 

		if ( !data?.curr ) return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};

		const { curr, prev, next } = data;

		props = {
			props: { blog: curr, prev, next, isPreview: preview || false },
			type: "blog",
		};

		if ( differenceInMonths( new Date(), parseISO( data.curr.modifiedAtISO )) < 1 ) {
			revalidate = shortCacheSeconds;
		}

	} else {			
		const blogs = await getAllBlogs();

		const pageNum = slug ? Math.max( Number( slug ), 1 ) : 1;
		const start = ( pageNum - 1 ) * postsPerPage;
		const end = start + postsPerPage;

		props = {
			type: "landing",
			props: {
				blogs: slice( blogs, start, end ),
				pageCount: Math.ceil( blogs.length / postsPerPage ),
				pageNum,
			},
		};


	}

	return {
		props,
		revalidate,
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const blogs = await getAllBlogs();

	const paths = [
		{ params: { page: undefined }},
		{ params: { page: [ "1" ]}},
		...compact( blogs?.map(({ slug }, i ) => {
			return ( slug && i < postsPerPage ) ? { params: { page: [ slug ]}} : false;
		}) || []),
	];

	return {
		paths,
		fallback: "blocking",
	};
};