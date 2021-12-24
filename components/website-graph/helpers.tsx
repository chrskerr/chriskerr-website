import type { ProbablyValidUrl } from 'lib/scraper/src';
import type { ScraperAPIBody, ScraperAPIResponse } from 'pages/api/scraper';
import { LayoutNode, Node } from '.';

export const fetchHrefs = async (
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

const calculateChildOfNode = (data: Node[], node: LayoutNode): LayoutNode[] => {
	const children = data.filter(({ parentId }) => parentId === node.id);
	return children.flatMap(child => {
		const childNode: LayoutNode = {
			...child,
			x: node.x + (Math.random() * 150 - 75),
			y: node.y + (Math.random() * 150 - 75),
			size: node.size,
		};
		return [childNode, ...calculateChildOfNode(data, childNode)];
	});
};

export const calculateLayoutNodes = (
	data: Node[],
	div: HTMLDivElement | null,
): LayoutNode[] => {
	const size = 15;

	if (!div) return [];
	const horizontalCenter = div.clientWidth / 2;

	div.style.minHeight = data.length * size * 2.5 + 'px';
	const verticalCenter = div.clientHeight / 2;

	const root = data.find(({ parentId }) => !parentId);
	if (!root) return [];

	const rootLayout: LayoutNode = {
		...root,
		x: horizontalCenter - size / 2,
		y: verticalCenter - size / 2,
		size,
	};

	const nodes = [rootLayout, ...calculateChildOfNode(data, rootLayout)];
	return nodes;
};
