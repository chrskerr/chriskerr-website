import type { ProbablyValidUrl } from 'lib/scraper/src';

import { ReactElement, useEffect, useRef, useState } from 'react';
import { isValidUrl } from 'lib/scraper/src/helpers';
import { nanoid } from 'nanoid';

import { calculateLayoutNodes, fetchHrefs, isTypeNode } from './helpers';
import GraphNode from './node';
import GraphConnector from './connector';
import { throttle } from 'lodash';

export type Node = {
	id: string;
	parentId: string | undefined;
	href: ProbablyValidUrl;
};

export type LayoutNode = Node & {
	type: 'node';
	x: number;
	y: number;
	size: number;
	colour: string;
};

export type LayoutConnector = {
	type: 'connector';
	id: string;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
};

const maxDepth = 4;

export default function WebsiteGrapher(): ReactElement {
	const $div = useRef<HTMLDivElement>(null);

	const [url, setUrl] = useState('https://www.chriskerr.com.au');
	const [loading, setLoading] = useState(false);

	const [data, setData] = useState<Node[]>([]);
	const [layoutData, setLayoutData] = useState<
		(LayoutNode | LayoutConnector)[]
	>([]);
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
			.map<Node>(href => ({ id: nanoid(), parentId, href }))
			.slice(0, 5);

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

	useEffect(() => {
		setLayoutData(calculateLayoutNodes(data, $div.current));
	}, [data]);

	useEffect(() => {
		const _resize = throttle(() => {
			setLayoutData(calculateLayoutNodes(data, $div.current));
		}, 100);

		window.addEventListener('resize', _resize, { passive: true });

		return () => {
			window.removeEventListener('resize', _resize);
		};
	});

	return (
		<div className="flex flex-col flex-1">
			<div className="display-width divider-before">
				<div
					className={`flex flex-col sm:flex-row items-start ${
						loading ? 'opacity-60' : ''
					}`}
				>
					<input
						type="text"
						className="w-full mb-4 mr-8 sm:flex-1 sm:mb-0"
						value={url}
						onChange={e => setUrl(e.target.value)}
						placeholder="https://..."
					/>
					<button
						className="button"
						onClick={() => requestUrl(url)}
						disabled={loading}
					>
						{loading ? 'Loading...' : 'Start!'}
					</button>
				</div>
			</div>
			<div
				ref={$div}
				className="relative flex-1 display-width divider-before min-h-[400px]"
			>
				{layoutData?.length > 0 &&
					layoutData.map(node =>
						isTypeNode(node) ? (
							<GraphNode
								key={node.id}
								x={node.x}
								y={node.y}
								size={node.size}
								href={node.href}
								colour={node.colour}
							/>
						) : (
							<GraphConnector
								key={node.id}
								startX={node.startX}
								startY={node.startY}
								endX={node.endX}
								endY={node.endY}
							/>
						),
					)}
			</div>
		</div>
	);
}
