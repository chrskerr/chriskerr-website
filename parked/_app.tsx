
import { ReactElement, useState, useCallback, useEffect } from "react";
import type { AppProps } from "next/app";
import Link from "next/link";
import Image from "next/image";

import { DefaultSeo } from "next-seo";
import debounce from "lodash/debounce";

import { Screensaver } from "components";
import "tailwindcss/tailwind.css";
import "../styles/index.css";
import { SearchBody, SearchResult } from "./api/search";

export const defaultTitle = "Chris Kerr";
export const shortCacheSeconds = 60 * 60; // 1 hour
export const longCacheSeconds = 12 * 60 * 60; // 12 hours

export default function App ({ Component, pageProps }: AppProps ): ReactElement {
	const [ searchInitialised, setSearchInitialised ] = useState( false );
	const [ searchShown, setSearchShown ] = useState( false );
	const [ terms, setTerms ] = useState( "" );
	const [ results, setResults ] = useState<SearchResult[ "data" ]>([]);
	const [ loading, setLoading ] = useState( false );

	const _search = useCallback( debounce( async ( terms: string ) => {
		if ( !terms ) {
			setResults([]);
		} else {
			const body: SearchBody = {
				terms,
			};
			const res = await fetch( "/api/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify( body ),
			});
			if ( res.ok ) {
				const data = await res.json() as SearchResult;
				setResults( data?.data || []);
			} else {
				setResults([]);
			}
		}
		setLoading( false );
	}, 500 ), []);

	useEffect(() => {
		_search( terms );
	}, [ terms ]);

	useEffect(() => {
		setTerms( "" );
		setResults([]);
	}, [ searchShown ]);

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
			<Screensaver />
			<div className={ `relative w-full ${ searchShown ? "no-scroll" : "" }` }>
				<div className="sticky top-0 z-10 w-full pb-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand before:via-[#89ffea] before:to-brand-secondary before:blur mb-16 sm:mb-32">
					<nav className="flex justify-center w-full bg-white blur-0">
						<div className="flex items-center p-3 sm:p-6 display-width">
							<Link href="/" passHref><a className="text-4xl font-extrabold transition sm:text-6xl font-heading hover:text-brand">CK</a></Link>
							<span className="flex-1" />
							<Link href="/editor" passHref><a className="mr-8 font-bold transition cursor-pointer md:text-lg icon-edit-2-after hover:text-brand after:ml-2">Editor</a></Link>
							<span className="text-3xl font-bold transition cursor-pointer icon-search hover:text-brand" onClick={ () => {
								setSearchShown( true );
								if ( !searchInitialised ) setSearchInitialised( true );
							}} />
						</div>
					</nav>
				</div>
				<Component { ...pageProps } />
				<footer className="flex flex-col items-center pb-12 mx-auto sm:flex-row sm:justify-between display-width divider-before">
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
			<aside 
				className={ `fixed flex justify-center items-center inset-0 ${ searchInitialised ? "transition duration-700" : "" } z-10 ${ searchShown ? "translate-x-0" : "translate-x-[100%] opacity-0" }` } 
				{ ...( searchShown && { onClick: () => setSearchShown( false ) }) }
			>
				<div className="w-full h-full p-6 sm:px-4 sm:py-0 sm:h-[80vh]">
					<div 
						className="w-full h-full py-10 overflow-y-scroll border rounded-xl glass display-width" 
						{ ...( searchShown && { onClick: e => e.stopPropagation() }) }
					>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-3xl">Search:</h2>
							<span 
								className="text-xl font-bold cursor-pointer icon-x hover:text-brand" 
								{ ...( searchShown && { onClick: () => setSearchShown( false ) }) }
							/>
						</div>
						<input 
							type="search" 
							value={ terms } 
							onChange={ e => {
								setLoading( true );
								setTerms( e.target.value );
							} } 
							placeholder="Search here" 
							className="w-full mb-8 rounded-md focus:ring-brand focus:border-brand" 
						/>
						<div>
							{ loading ? 
								<p className="text-xl font-heading">Loading...</p> :
								terms ? 
									( results && Array.isArray( results ) && results.length > 0 ) ? 
										results.map( result => (
											<div key={ result.slug } className="p-4 mb-6 border rounded-md">
												<Link href={ `/${ result.slug }` } passHref><a className="block mb-1 text-xl font-bold hover:underline font-heading" onClick={ () => setSearchShown( false ) }>{ result.title }</a></Link>
												<p className="mb-4">{ result.description }</p>
												<p className="text-gray-600 sm:text-sm">Relevance: { result.relevance }%</p>
											</div>
										)) : 
										<p className="text-xl font-heading">No results found</p> : 
									false
							}
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
