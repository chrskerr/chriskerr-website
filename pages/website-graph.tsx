import { ChangeEvent, ReactElement, useState } from 'react';
import { NextSeo } from 'next-seo';

const title = 'Website Connection Graph Visualiser';

export default function JavascriptRandomness(): ReactElement {
	const [url, setUrl] = useState('');
	const [urlError, setUrlError] = useState(false);
	const [loading] = useState(false);

	const requestUrl = async () => {
		if (loading) return;

		console.log(url);
	};

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUrl(value);
		if (!value.startsWith('https://')) setUrlError(true);
		else setUrlError(false);
	};

	return (
		<>
			<NextSeo
				title={title}
				description="Visualise outbound connections from a particular website"
				canonical="https://www.chriskerr.com.au/website-graph"
			/>
			<div className="display-width">
				<h2 className="mb-4 text-3xl">{title}</h2>
				<p className="mb-4">
					I wanted an excuse to start building a webscaper... so here
					is the starting block!
				</p>
			</div>
			<div className="display-width divider-before">
				<div
					className={`flex flex-col items-start ${
						loading ? 'opacity-60' : ''
					}`}
				>
					<input
						type="text"
						value={url}
						onChange={onChange}
						placeholder="Target URL"
					/>
					<button
						className="mt-8 button"
						onClick={requestUrl}
						disabled={loading}
					>
						{loading ? 'Loading...' : 'Generate!'}
					</button>
				</div>
			</div>
		</>
	);
}
