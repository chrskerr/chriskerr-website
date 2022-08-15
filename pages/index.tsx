import { ReactElement } from 'react';

import { NextSeo, SocialProfileJsonLd } from 'next-seo';
import { defaultTitle } from 'pages/_app';
import Link from 'next/link';
import Image, { ImageProps } from 'next/image';
import { BlogPostSlugs, BlogPostTitles } from 'types/writing';

export const description =
	"My site features a jumble of hobby projects where I play around with some technologies & tools that I'm interested to learn.";
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
					<p className="pb-8 mx-6 text-2xl">Welcome!</p>
					<p className="mx-6 text-2xl">{description}</p>
				</div>
			</section>
			<section className="w-full">
				<div className="grid grid-cols-1 gap-16 md:grid-cols-2 grid-rows-auto display-width divider-before">
					<Tile
						url="/editor"
						title="Collaborative Markdown Editor"
						image="/images/tiles/meerkats.png"
						objectPosition="center 30%"
					/>
					<Tile
						url="/leo"
						title="Low Earth Orbit"
						image="/images/tiles/young_astronaut.png"
						objectPosition="center 55%"
					/>
					<Tile
						url={`/writing/${BlogPostSlugs.ASYNC_FUNCTIONS}`}
						title={BlogPostTitles.ASYNC_FUNCTIONS}
						image="/images/tiles/froot_loops.png"
						objectPosition="center 70%"
					/>
					<Tile
						url="/quick-and-dead"
						title="Quick &amp; Dead Generator"
						image="/images/tiles/dancing_reaper.png"
						objectPosition="center 15%"
					/>
					<Tile
						url="/javascript-randomness"
						title="Javascript Random Number Generation"
						image="/images/tiles/numbers.png"
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
	objectPosition = 'center',
}: {
	url: string;
	title: string;
	image: `/images/tiles/${string}`;
	objectPosition?: ImageProps['objectPosition'];
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
						objectPosition={objectPosition}
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
