import { ReactElement } from 'react';

import { NextSeo, SocialProfileJsonLd } from 'next-seo';
import { defaultTitle } from 'pages/_app';
import Link from 'next/link';
import { BlogPostSlugs, BlogPostTitles } from 'types/writing';

export const description =
	"My site features a handful of hobby projects where I play around with some technologies & tools that I'm interested to learn.";
const url = `${process.env.NEXT_PUBLIC_URL_BASE}`;

const links: [string, string][] = [
	['/editor', 'Collaborative Markdown Editor'],
	['https://tasks.chriskerr.dev', 'Minimal Tasks / Reminders List'],
	['/leo', 'Low Earth Orbit'],
	['/emdr', 'EMDR Dot'],
	[
		`/writing/${BlogPostSlugs.ASYNC_FUNCTIONS}`,
		BlogPostTitles.ASYNC_FUNCTIONS,
	],
	['/javascript-randomness', 'Javascript Random Number Generation'],
	['/quick-and-dead', 'Quick & Dead Generator'],
];

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
			<section className="mb-12 display-width">
				<p className="pb-8 text-2xl">Welcome!</p>
				<p>{description}</p>
			</section>
			<section className="display-width">
				<ul className="pl-20">
					{links.map(([url, title]) => (
						<li
							key={url}
							className="mb-2 list-outside list-[binary]"
						>
							<Link
								href={url}
								className="underline transition-colors hover:text-brand underline-offset-4"
							>
								{title}
							</Link>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
