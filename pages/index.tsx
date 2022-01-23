import { ReactElement } from 'react';

import { NextSeo, SocialProfileJsonLd } from 'next-seo';
import { defaultTitle } from 'pages/_app';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPostSlugs, BlogPostTitles } from 'types/writing';

export const description = "Stuff I've built, things that I like.";
const url = `${process.env.NEXT_PUBLIC_URL_BASE}`;

export default function Landing(): ReactElement {
	return (
		<>
			<NextSeo
				description={description}
				canonical={url}
				openGraph={{
					title: defaultTitle,
					url,
					description,
					type: 'profile',
					profile: {
						firstName: 'Chris',
						lastName: 'Kerr',
						gender: 'male',
					},
				}}
			/>
			<SocialProfileJsonLd
				type="Person"
				name="Chris Kerr"
				url={url}
				sameAs={[
					'https://www.linkedin.com/in/chrskerr/',
					'https://github.com/chrskerr',
				]}
			/>
			<section className="w-full">
				<div className="text-center display-width">
					<p className="mx-6 text-2xl">{description}</p>
				</div>
			</section>
			<section className="w-full">
				<div className="grid grid-cols-1 gap-16 md:grid-cols-2 grid-rows-auto display-width divider-before">
					<Tile
						url="/editor"
						title="Collaborative Markdown Editor"
						image="/images/tiles/stacked-waves.png"
					/>
					<Tile
						url="/bird-eat-bird"
						title="Bird Eat Bird"
						image="/images/tiles/bird-eat-bird.png"
					/>
					<Tile
						url={`/writing/${BlogPostSlugs.ASYNC_FUNCTIONS}`}
						title={BlogPostTitles.ASYNC_FUNCTIONS}
						image="/images/tiles/asynchronous_function_tile.png"
					/>
					<Tile
						url="/quick-and-dead"
						title="Quick &amp; Dead Generator"
						image="/images/tiles/q&amp;d_tile.png"
					/>
					<Tile
						url="/website-graph"
						title="Website Connection Graph Visualiser"
						image="/images/tiles/website.png"
					/>
					<Tile
						url="/javascript-randomness"
						title="Javascript Random Number Generation"
						image="/images/tiles/blob-scatter.png"
					/>
					<Tile
						url="/space"
						title="Just how busy is space"
						image="/images/tiles/stars.png"
					/>
				</div>
			</section>
		</>
	);
}

function Tile({
	url,
	title,
	image,
}: {
	url: string;
	title: string;
	image: `/images/tiles/${string}`;
}) {
	return (
		<Link href={url} passHref>
			<a>
				<div className="group relative shadow-lg rounded-2xl aspect-[5/3] border overflow-hidden transform-fix">
					<Image
						src={image}
						alt={title}
						layout="fill"
						objectFit="cover"
						objectPosition="center"
						sizes="(max-width: 768px) 100vw, 440px"
						className="transition-all duration-700 group-hover:scale-[1.15]"
					/>
					<p className="absolute flex items-center justify-center px-5 py-3 text-lg text-center -translate-x-1/2 -translate-y-1/2 bg-white rounded top-1/2 left-1/2">
						{title}
					</p>
				</div>
			</a>
		</Link>
	);
}
