import { GetStaticPaths, GetStaticProps } from 'next';
import type { Blog } from 'types/writing';

import { ReactElement, useState } from 'react';
import Head from 'next/head';
import { NextSeo, BlogJsonLd } from 'next-seo';
import { marked } from 'marked';
import hljs from 'highlight.js';

import { defaultTitle } from 'pages/_app';
import allWriting from 'writing';

import { UpApiReturn } from 'socket-server/up';
import { socketServerUrl } from 'lib/constants';

import 'highlight.js/styles/github.css';

export default function Finances(): ReactElement {
	const [password, setPassword] = useState('');
	const [data, setData] = useState<UpApiReturn>();
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		if (!password) return;
		setLoading(true);
		try {
			const res = await fetch(socketServerUrl + '/up/week', {
				headers: new Headers({ api_key: password }),
			});
			if (res.ok) {
				// const resBody = await res.json();
				console.log(res);
			}
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	};

	return (
		<>
			<NextSeo noindex={true} nofollow={true} />
			<div className="display-width">
				<h2 className="mb-4 text-3xl">Our Finances</h2>
			</div>
			<div className="display-width divider-before">
				{data ? (
					<></>
				) : (
					<>
						<input
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							disabled={loading}
						/>
						<button
							className="button"
							onClick={handleLogin}
							disabled={loading}
						>
							Login
						</button>
					</>
				)}
			</div>
		</>
	);
}
