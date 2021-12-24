import type { ProbablyValidUrl } from 'lib/scraper/src';

import { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { isValidUrl } from 'lib/scraper/src/helpers';
import { nanoid } from 'nanoid';

import { calculateLayoutNodes, fetchHrefs } from './helpers';

import dynamic from 'next/dynamic';
const GraphNode = dynamic(() => import('./node'));

export type Node = {
	id: string;
	parentId: string | undefined;
	href: ProbablyValidUrl;
};

export type LayoutNode = Node & {
	x: number;
	y: number;
	size: number;
};

const maxDepth = 3;

export default function WebsiteGrapher(): ReactElement {
	const $div = useRef<HTMLDivElement>(null);

	const [url, setUrl] = useState('https://www.chriskerr.com.au');
	const [urlError, setUrlError] = useState(false);
	const [loading, setLoading] = useState(false);

	const [data, setData] = useState<Node[]>([]);
	const [layoutData, setLayoutData] = useState<LayoutNode[]>([]);
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

		if (depth < maxDepth) {
			await Promise.all(
				newNodes.map(async node => {
					await new Promise(resolve => {
						setTimeout(async () => {
							await requestUrl(node.href, depth + 1, node.id);
							resolve(undefined);
						}, Math.random() * 3_000);
					});
				}),
			);
		}

		if (depth === 0) {
			setLoading(false);
		}
	};

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUrl(value);
		if (!value.startsWith('https://')) setUrlError(true);
		else setUrlError(false);
	};

	useEffect(() => {
		setLayoutData(calculateLayoutNodes(data, $div.current));
	}, [data]);

	return (
		<div className="flex flex-col flex-1">
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
			<div
				ref={$div}
				className="relative flex-1 transition-all duration-1000 ease-linear display-width divider-before"
			>
				{layoutData?.length > 0 &&
					layoutData.map(node => (
						<GraphNode
							key={node.id}
							x={node.x}
							y={node.y}
							size={node.size}
							href={node.href}
						/>
					))}
			</div>
		</div>
	);
}
