import { ChangeEvent, ReactElement, useRef, useState } from 'react';
import { NextSeo } from 'next-seo';
import { ScraperAPIBody, ScraperAPIResponse } from './api/scraper';
import { isValidUrl } from 'lib/scraper/src/helpers';
import { ProbablyValidUrl } from 'lib/scraper/src';
import { nanoid } from 'nanoid';

const title = 'Website Connection Graph Visualiser';

type Node = {
	id: string;
	parentId: string | undefined;
	href: ProbablyValidUrl;
};

const fetchHrefs = async (
	url: ProbablyValidUrl,
): Promise<ProbablyValidUrl[]> => {
	const body: ScraperAPIBody = { url };
	const result = await fetch('/api/scraper', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (result.ok) {
		const { hrefs } = (await result.json()) as ScraperAPIResponse;
		return hrefs || [];
	}
	return [];
};

export default function JavascriptRandomness(): ReactElement {
	const [url, setUrl] = useState('https://www.chriskerr.com.au');
	const [urlError, setUrlError] = useState(false);
	const [loading, setLoading] = useState(false);

	const [data, setData] = useState<Node[]>([]);
	const seenUrls = useRef<ProbablyValidUrl[]>([]);

	const requestUrl = async (url: string, depth = 0, parentId = nanoid()) => {
		if (!isValidUrl(url)) return;
		if (loading && depth === 0) return;
		if (depth === 0) {
			seenUrls.current = [url];
			setLoading(true);
			setData([{ id: parentId, href: url, parentId: undefined }]);
		}

		const newHrefs = await fetchHrefs(url);
		const newNodes = newHrefs
			.filter(href => !seenUrls.current.includes(href))
			.map<Node>(href => ({ id: nanoid(), parentId, href }));

		seenUrls.current = [...seenUrls.current, ...newHrefs];

		setData(nodes => [...nodes, ...newNodes]);

		if (depth < 4) {
			await Promise.all(
				newNodes.map(async node => {
					await new Promise(resolve => {
						setTimeout(async () => {
							await requestUrl(node.href, depth + 1);
							resolve(undefined);
						}, Math.random() * 3_000);
					});
				}),
			);
		}

		if (depth === 0) {
			setLoading(false);
			console.log('done');
		}
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
					is the start!
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
						placeholder="https://..."
					/>
					<button
						className="mt-8 button"
						onClick={() => requestUrl(url)}
						disabled={loading}
					>
						{loading ? 'Loading...' : 'Start!'}
					</button>
				</div>
			</div>
			<div className="display-width divider-before">
				{data.length > 0 &&
					data.map(node => (
						<p key={node.id}>
							{node.href} - {node.id} - {node.parentId}
						</p>
					))}
			</div>
		</>
	);
}
