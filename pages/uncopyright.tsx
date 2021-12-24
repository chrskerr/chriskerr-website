import { ReactElement } from 'react';
import { NextSeo } from 'next-seo';

const url = process.env.NEXT_PUBLIC_URL_BASE || 'https://www.chriskerr.com.au';
const description = 'Uncopyright declaration';
const title = 'Uncopyright';

export const lastmod = '2021-09-24';
// consider updating lastmod date in sitemap too, if you change this

export default function UncopyrightDeclaration(): ReactElement {
	return (
		<>
			<NextSeo
				title={title}
				description={description}
				canonical={url}
				openGraph={{
					type: 'article',
					title: `${title} - Chris Kerr`,
					url,
					description,
				}}
			/>
			<div className="flex flex-col items-center w-full mt-12">
				<h1 className="mb-6 text-2xl font-bold text-center sm:text-3xl display-width">
					{title}
				</h1>
				<p className="text-lg text-center display-width">
					{description}
				</p>
				<div className="w-full prose divider-before">
					<p>
						This blog is Uncopyrighted. Its author,{' '}
						<i>Chris Kerr</i>, has released all claims on copyright
						and has put all the content of this blog into the public
						domain.
					</p>
					<p>
						No permission is needed to copy, distribute, or modify
						the content of this site. Credit is appreciated but not
						required.
					</p>
					<br />
					<h6>
						<b>
							Terms and Conditions for Copying, Distribution and
							Modification:
						</b>
					</h6>
					<ol>
						<li>none.</li>
					</ol>
					<br />
					<p>
						Further reading:{' '}
						<a
							href="https://uncopyright.org/"
							target="_blank"
							rel="noreferrer"
						>
							Uncopyright
						</a>
					</p>
				</div>
			</div>
		</>
	);
}
