
import { ReactElement } from "react";

import { NextSeo, SocialProfileJsonLd } from "next-seo";
import { defaultTitle } from "pages/_app";
import Link from "next/link";
import Image from "next/image";

export const description = "Stuff I've built, things that I like.";
const url = `${ process.env.NEXT_PUBLIC_URL_BASE }`;

export default function Landing (): ReactElement {	
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
			<section className="w-full">
				<div className="text-center display-width">
					<h1 className="mb-8 text-4xl uppercase">Chris Kerr</h1>
					<p className="mb-6 text-xl">{ description }</p>
				</div>
			</section>
			<section className="w-full">
				<div className="grid grid-cols-1 gap-16 sm:grid-cols-2 grid-rows-auto display-width divider-before">
					<Link href="/editor" passHref>
						<a>
							<div className="group relative shadow-lg rounded-2xl aspect-[5/3] border overflow-hidden transform-fix">
								<Image 
									src="/images/stacked-waves.png" 
									alt="blue stacked waves"
									layout="fill" 
									objectFit="cover"
									objectPosition="center"
									sizes="1033w"
									className="transition-all duration-700 group-hover:scale-[1.15]"
								/>
								<p className="absolute flex items-center justify-center px-5 py-3 text-2xl text-center -translate-x-1/2 -translate-y-1/2 bg-white rounded sm:text-lg top-1/2 left-1/2">Collaborative Markdown Editor</p>
							</div>
						</a>
					</Link>
					<Link href="/bird-eat-bird" passHref>
						<a>
							<div className="group relative shadow-lg rounded-2xl aspect-[5/3] border overflow-hidden transform-fix">
								<Image 
									src="/images/bird-eat-bird.png" 
									alt="blue stacked waves"
									layout="fill" 
									objectFit="cover"
									objectPosition="center"
									sizes="1033w"
									className="transition-all duration-700 group-hover:scale-[1.15]"
								/>
								<p className="absolute flex items-center justify-center px-5 py-3 text-2xl text-center -translate-x-1/2 -translate-y-1/2 bg-white rounded sm:text-lg top-1/2 left-1/2">Bird Eat Bird</p>
							</div>
						</a>
					</Link>
				</div>
			</section>
		</>
	);
}
