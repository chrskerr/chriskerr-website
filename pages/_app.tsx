import type { ReactElement } from 'react';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import Image from 'next/image';
import Router from 'next/router';
import nProgress from 'nprogress';

Router.events.on('routeChangeStart', () => nProgress.start());
Router.events.on('routeChangeComplete', () => nProgress.done());
Router.events.on('routeChangeError', () => nProgress.done());

import { DefaultSeo } from 'next-seo';

import 'tailwindcss/tailwind.css';
import '../styles/index.css';

export const defaultTitle = 'Chris Kerr';

export default function App({ Component, pageProps }: AppProps): ReactElement {
	return (
		<>
			<DefaultSeo
				titleTemplate={`%s - ${defaultTitle}`}
				defaultTitle={defaultTitle}
				openGraph={{
					images: [
						{
							url: `${process.env.NEXT_PUBLIC_URL_BASE}/_next/image?url=%2Fimages%2Fme.jpeg&w=1200&q=75`,
							width: 1200,
							height: 1200,
							alt: 'Photo of me',
						},
					],
				}}
			/>
			<div className="flex flex-col w-full min-h-screen font-mono">
				<div className="sticky top-0 z-[51] w-full pb-0 before:absolute before:inset-0 nav-gradient before:blur mb-16 sm:mb-24">
					<nav className="flex justify-center w-full bg-white blur-0">
						<div className="flex items-center py-3 display-width">
							<Link
								href="/"
								className="text-3xl transition sm:text-4xl hover:text-brand"
							>
								Chris Kerr
							</Link>
						</div>
					</nav>
				</div>
				<div className="flex flex-col flex-1">
					<Component {...pageProps} />
				</div>
				<footer className="flex flex-col items-center pb-12 mx-auto sm:flex-row sm:justify-between display-width divider-before">
					<Link href="/uncopyright" className="mb-4 sm:mb-0">
						<Image
							src="/images/uncopyrighted-black_1@2x.png"
							width={(50 * 1296) / 392}
							height={50}
							alt="Uncopywrited notice"
						/>
					</Link>
					<div className="mb-8 sm:mb-0">
						<Image
							src="/images/me.jpeg"
							width={50}
							height={50}
							alt="Photo of me"
							className="rounded-full"
						/>
					</div>
					<p>
						Designed by{' '}
						<a
							className="text-brand hover:underline"
							href="https://www.katehobbs.com.au/"
							target="_blank"
							rel="noreferrer"
						>
							Kate Hobbs
						</a>
					</p>
				</footer>
			</div>
		</>
	);
}
