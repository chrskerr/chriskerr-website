
import type { ReactElement } from "react";
import type { AppProps } from "next/app";
import Link from "next/link";
import Image from "next/image";
import Router from "next/router";
import nProgress from "nprogress";

import { DefaultSeo } from "next-seo";

import { Screensaver } from "components";
import "tailwindcss/tailwind.css";
import "../styles/index.css";
import { ElementIds } from "components/bird-eat-bird/types";

export const defaultTitle = "Chris Kerr";
export const shortCacheSeconds = 60 * 60; // 1 hour
export const longCacheSeconds = 12 * 60 * 60; // 12 hours


Router.events.on( "routeChangeStart", () => nProgress.start());
Router.events.on( "routeChangeComplete", () => nProgress.done());
Router.events.on( "routeChangeError", () => nProgress.done());
nProgress.configure({ showSpinner: false, easing: "ease", speed: 500 });

export default function App ({ Component, pageProps }: AppProps ): ReactElement {
	return (
		<>
			<DefaultSeo
				titleTemplate={ `%s - ${ defaultTitle }` }
				defaultTitle={ defaultTitle }
				openGraph={{
					images: [
						{
							url: `${ process.env.NEXT_PUBLIC_URL_BASE }/_next/image?url=%2Fimages%2Fme.jpeg&w=1200&q=75`,
							width: 1200,
							height: 1200,
							alt: "Photo of me",
						},
					],
				}}
			/>
			{/* <Screensaver /> */}
			<div className="relative flex flex-col w-full min-h-screen">
				<div className="sticky top-0 z-10 w-full pb-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand before:via-[#89ffea] before:to-brand-secondary before:blur mb-16 sm:mb-32">
					<nav className="flex justify-center w-full bg-white blur-0">
						<div className="flex items-center p-3 sm:p-6 display-width">
							<Link href="/" passHref><a className="text-4xl font-extrabold transition sm:text-6xl font-heading hover:text-brand">CK</a></Link>
						</div>
					</nav>
				</div>
				<div className="flex-1">
					<Component { ...pageProps } />
				</div>
				<footer id={ ElementIds.FOOTER } className="flex flex-col items-center pb-12 mx-auto sm:flex-row sm:justify-between display-width divider-before">
					<Link href="/uncopyright" passHref>
						<a className="mb-4 sm:mb-0">
							<Image 
								src="/images/uncopyrighted-black_1@2x.png"
								width={ 50 * 1296 / 392 }
								height={ 50 }
								layout="fixed"
								alt="Uncopywrited notice"
							/>
						</a>
					</Link>
					<p>Designed by <a className="text-brand hover:underline" href='https://www.katehobbs.com.au/' target="_blank" rel="noreferrer">Kate Hobbs</a></p>
				</footer>
			</div>
		</>
	);
}
