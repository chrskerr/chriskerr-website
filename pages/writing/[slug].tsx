import { GetStaticPaths, GetStaticProps } from 'next';
import type { Blog } from 'types/writing';

import { ReactElement, useMemo } from 'react';
import Head from 'next/head';
import { NextSeo, ArticleJsonLd } from 'next-seo';
import { marked } from 'marked';
import hljs from 'highlight.js';

import { defaultTitle } from 'pages/_app';
import allWriting from 'writing';

import 'highlight.js/styles/github.css';

export default function AsyncFunctionSerialiser(blog: Blog): ReactElement {
	const {
		title,
		description,
		url,
		tags,
		publishedAtISO,
		modifiedAtISO,
		htmlContent,
		publishedAtString,
	} = blog;
	const trimmedTitle = title.slice(0, 70 - defaultTitle.length - 3) || title;
	const prefetchData = useMemo(
		() => [...htmlContent.matchAll(/data-prefetch-href=\S+/g)],
		[htmlContent],
	);

	return (
		<>
			<NextSeo
				title={trimmedTitle}
				description={description}
				canonical={url}
				openGraph={{
					type: 'article',
					title: `${trimmedTitle} - Chris Kerr`,
					url,
					description,
					article: {
						tags,
						publishedTime: publishedAtISO,
						modifiedTime: modifiedAtISO,
						authors: ['Chris Kerr'],
					},
				}}
			/>
			<ArticleJsonLd
				url={url}
				title={`${trimmedTitle} - Chris Kerr`}
				images={[
					`${process.env.NEXT_PUBLIC_URL_BASE}/_next/image?url=%2Fimages%2Fme.jpeg&w=1200&q=75`,
				]}
				datePublished={publishedAtISO}
				dateModified={modifiedAtISO}
				authorName="Chris Kerr"
				description={description}
			/>
			<Head>
				{Array.isArray(prefetchData) &&
					prefetchData.map(([data], i) => {
						if (typeof data !== 'string') return false;

						return (
							<link
								key={i}
								rel="prefetch"
								href={data
									.replace('data-prefetch-href="', '')
									.replace('"', '')}
								as="document"
							/>
						);
					})}
			</Head>
			<div className="flex flex-col w-full">
				<h1 className="mb-4 text-4xl display-width">{title}</h1>
				<p className="mb-2 text-lg display-width">{description}</p>
				<div className="display-width">
					<p className="text-gray-600 sm:text-sm">
						Written: {publishedAtString}
					</p>
				</div>
				<div
					className="w-full prose divider-before"
					dangerouslySetInnerHTML={{ __html: htmlContent }}
				/>
			</div>
		</>
	);
}

export const getStaticProps: GetStaticProps = context => {
	const post = allWriting.find(({ slug }) => slug === context.params?.slug);

	if (!post) {
		return {
			notFound: true,
		};
	}

	const { markdown, ...rest } = post;

	const htmlContent = marked.parse(markdown, {
		highlight: (code, lang) => {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		},
		langPrefix: 'hljs language-',
	});

	const props: Blog = {
		...rest,
		url: `${process.env.NEXT_PUBLIC_URL_BASE}/writing/${rest.slug}`,
		htmlContent,
	};

	return { props };
};

export const getStaticPaths: GetStaticPaths = () => {
	const paths = allWriting.map(({ slug }) => `/writing/${slug}`);

	return {
		paths,
		fallback: false,
	};
};
