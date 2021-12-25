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

type NodeTree = {
	depth: number;
	maxDepth: number;
	node: Node;
	children: NodeTree[];
};

const createNodeTree = (
	data: Node[],
	target: Node,
	depth: number,
): NodeTree => {
	const childNodes = data.filter(({ parentId }) => parentId === target.id);

	const children = childNodes.map(child =>
		createNodeTree(data, child, depth + 1),
	);

	const maxDepth = children.reduce<number>(
		(acc, { maxDepth }) => Math.max(acc, maxDepth),
		depth,
	);

	return {
		depth,
		maxDepth,
		node: target,
		children,
	};
};

type CreateNoteTreeProps = {
	size: number;
	tree: NodeTree;
	maxDepth: number;
	parent?: LayoutNode;
	degrees?: number;
};

const createNodeLayoutFromTree = ({
	size,
	tree,
	maxDepth,
	parent,
	degrees,
}: CreateNoteTreeProps): LayoutNode[] => {
	const { children, depth } = tree;

	const radius = 1 - (depth / maxDepth) * 0.5;

	const node: LayoutNode =
		parent && degrees !== undefined
			? {
					...tree.node,
					x: parent.x + radius * Math.cos((degrees * Math.PI) / 180),
					y: parent.y + radius * Math.sin((degrees * Math.PI) / 180),
					size,
					colour: 'var(--brand-blue)',
			  }
			: {
					...tree.node,
					x: 0.5,
					y: 0.5,
					size,
					colour: 'var(--brand-secondary)',
			  };

	const childDegreesRange = degrees ? 180 : 360;
	const childDegreesMin = degrees ? degrees - 90 : 0;

	const getDegrees = (index: number) =>
		Math.floor(
			(((360 * index) / children.length - childDegreesMin) /
				childDegreesRange) *
				360,
		);

	const childNotes = children.flatMap((child, i) =>
		createNodeLayoutFromTree({
			size,
			tree: child,
			maxDepth,
			parent: node,
			degrees: getDegrees(i),
		}),
	);

	return [node, ...childNotes];
};

export const calculateLayoutNodes = (
	data: Node[],
	div: HTMLDivElement | null,
): LayoutNode[] => {
	const size = 15;

	if (!div) return [];

	const root = data.find(({ parentId }) => !parentId);
	if (!root) return [];

	const tree = createNodeTree(data, root, 0);
	const { maxDepth } = tree;

	const unadjustedNodes = createNodeLayoutFromTree({
		size,
		tree,
		maxDepth,
	});

	const { maxX, minX, maxY, minY } = unadjustedNodes.reduce<{
		maxX: number;
		minX: number;
		maxY: number;
		minY: number;
	}>(
		(acc, curr) => ({
			maxX: Math.max(acc.maxX, curr.x),
			minX: Math.min(acc.minX, curr.x),
			maxY: Math.max(acc.maxY, curr.y),
			minY: Math.min(acc.minY, curr.y),
		}),
		{ maxX: 0, minX: 1, maxY: 0, minY: 1 },
	);

	const widestX = Math.max(maxX, 1 - minX);
	const widestY = Math.max(maxY, 1 - minY);

	const rangeX = widestX - (1 - widestX);
	const rangeY = widestY - (1 - widestY);

	const adjustX = (x: number) => {
		return (
			div.clientWidth * 0.2 +
			(rangeX ? (x - (1 - widestX)) / rangeX : 0.5) *
				div.clientWidth *
				0.6
		);
	};

	const adjustY = (y: number) => {
		return (
			div.clientHeight * 0.2 +
			(rangeY ? (y - (1 - widestY)) / rangeY : 0.5) *
				div.clientHeight *
				0.6
		);
	};

	return unadjustedNodes.map(node => ({
		...node,
		x: adjustX(node.x),
		y: adjustY(node.y),
	}));
};
