
import { ReactElement, useState } from "react";
import Image from "next/image";
import Link from "next/link";


import { Blog } from "parked/fetch-data";
import { NextSeo, SocialProfileJsonLd } from "next-seo";
import { defaultTitle } from "pages/_app";

export interface LandingProps {
	pageNum: number,
	blogs: Blog[],
	pageCount: number,
}

export const description = "My public journal: coding, life and whatever is in my head.";
const url = `${ process.env.NEXT_PUBLIC_URL_BASE }`;

export default function Landing ({ blogs, pageNum, pageCount }: LandingProps ): ReactElement {	
	const [ isExpanded, setExpanded ] = useState( false );

	return (
		<>
			<NextSeo
				description={ description }
				canonical={ url }
				openGraph={{
					title: defaultTitle, url, description,
					type: "profile",
					profile: {
						firstName: "Chris",
						lastName: "Kerr",
						gender: "male",
					},
				}}
			/>
			<SocialProfileJsonLd
				type="Person"
				name="Chris Kerr"
				url={ url }
				sameAs={[
					"https://www.linkedin.com/in/chrskerr/",
					"https://github.com/chrskerr",
				]}
			/>
			<section className="flex flex-col items-center w-full">
				<h1 className="mb-8 text-4xl uppercase">Chris Kerr</h1>
				<p className="mb-12 text-xl text-center display-width">{ description }</p>
				<div className="flex items-center mb-8 cursor-pointer" onClick={ () => setExpanded( e => !e ) }>
					<p className="mr-2 uppercase font-heading">About Me</p>
					<span className={ `ml-2 text-lg icon-arrow-down-circle transition-transform transform transform-gpu ${ isExpanded ? "rotate-180" : "" }` } />
				</div>
				<div className={ `flex flex-col items-center display-width sm:flex-row overflow-hidden transition ${ isExpanded ? "h-auto mb-12" : "h-0 mb-0" }` }>
					<div className="flex items-center mb-8 sm:mb-0 w-[250px] sm:pr-4">
						<Image 
							src="/images/me.jpeg"
							alt="A photo of me"
							layout="fixed"
							height={ 250 }
							width={ 250 }
							objectFit="cover"
							objectPosition="center"
							className="rounded"
						/>
					</div>
					<div className="flex items-center flex-1 pl-4">
						<p>I&apos;ll definitely get around to writing this soon...</p>
					</div>
				</div>
			</section>
			<section className="mb-8 display-width">
				{ Array.isArray( blogs ) && blogs.map( blog => {
					const { slug, title, description, publishedAtString } = blog;
					return (
						<article key={ slug } className="w-full mb-16 divider-before">
							<Link href={ `/${ slug }` } passHref><a className="block w-full mb-8 text-xl font-bold text-center font-heading hover:underline">{ title }</a></Link>
							<p className="mb-6">{ description }</p>
							<p className="text-gray-600 sm:text-sm font-heading">Written: { publishedAtString }</p>
						</article>
					);
				})}
			</section>
			<section className="flex flex-col items-center mb-8 display-width divider-before">
				<p className="mb-4 text-lg">Pages:</p>
				<div className="flex items-center justify-center w-full">
					{ ( new Array( pageCount )).fill( 0 ).map(( el, i ) => {
						const page = i + 1;
						return (
							<Link key={ page } href={`/${ page }`} passHref>
								<a className={ `mx-3 text-lg hover:underline transition cursor-pointer ${ page === pageNum ? "font-bold text-brand-dark" : "text-brand" }` }>{ page }</a>
							</Link>
						);
					})}
				</div>
			</section>
		</>
	);
}