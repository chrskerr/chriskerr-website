import type { ProbablyValidUrl } from 'lib/scraper/src';
import throttle from 'lodash/throttle';
import type { ScraperAPIBody, ScraperAPIResponse } from 'pages/api/scraper';
import type { LayoutConnector, LayoutNode, Node } from 'types/website-graph';

export const defaultSize = 15;

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
	totalNodes: number;
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

	const totalNodes =
		children.reduce<number>((acc, { totalNodes }) => acc + totalNodes, 1) ||
		1;

	return {
		depth,
		maxDepth,
		node: target,
		children,
		totalNodes,
	};
};

type CreateNoteTreeProps = {
	tree: NodeTree;
	maxDepth: number;
	parent?: LayoutNode;
	availableDegreesStart: number;
	availableDegreesEnd: number;
};

const getRadians = (degrees: number) => (degrees * Math.PI) / 180;

const createNodeLayoutFromTree = ({
	tree,
	maxDepth,
	parent,
	availableDegreesStart,
	availableDegreesEnd,
}: CreateNoteTreeProps): (LayoutNode | LayoutConnector | undefined)[] => {
	const { children, depth } = tree;

	// const radius = 1 - (tree.depth / maxDepth) * 0.5;

	const availableDegreesWidth = availableDegreesEnd - availableDegreesStart;
	const degrees = availableDegreesStart + availableDegreesWidth / 2;

	const node: LayoutNode =
		parent && degrees !== undefined
			? {
					...tree.node,
					type: 'node',
					x: parent.x + Math.cos(getRadians(degrees + depth * 5)),
					y: parent.y + Math.sin(getRadians(degrees + depth * 5)),
					size: defaultSize,
					colour: 'var(--brand-blue)',
			  }
			: {
					...tree.node,
					type: 'node',
					x: 0.5,
					y: 0.5,
					size: defaultSize * 1.5,
					colour: 'var(--brand-secondary)',
			  };

	const connector: LayoutConnector | undefined = parent
		? {
				id: node.id + '_connector',
				type: 'connector',
				start: { ...parent },
				end: { ...node },
		  }
		: undefined;

	const totalNodesBelow = children.reduce<number>(
		(acc, { totalNodes }) => acc + totalNodes,
		0,
	);
	const degreesPerNode = availableDegreesWidth / totalNodesBelow;

	let childNodesAllocated = 0;

	const getChildDegrees = (totalNodes: number) => {
		const childsAvailableDegreesStart =
			availableDegreesStart + childNodesAllocated * degreesPerNode;
		const childsAvailableDegreesEnd =
			childsAvailableDegreesStart + totalNodes * degreesPerNode;

		childNodesAllocated += totalNodes;
		return {
			availableDegreesStart: childsAvailableDegreesStart,
			availableDegreesEnd: childsAvailableDegreesEnd,
		};
	};

	const childNotes = children.flatMap(child =>
		createNodeLayoutFromTree({
			tree: child,
			maxDepth,
			parent: node,
			...getChildDegrees(child.totalNodes),
		}),
	);

	return [node, connector, ...childNotes];
};

export const calculateLayoutNodes = throttle(
	(
		data: Node[],
		div: HTMLDivElement | null,
	): (LayoutNode | LayoutConnector)[] => {
		if (!div) return [];

		const root = data.find(({ parentId }) => !parentId);
		if (!root) return [];

		const tree = createNodeTree(data, root, 0);
		const { maxDepth } = tree;

		const unadjustedNodes = createNodeLayoutFromTree({
			tree,
			maxDepth,
			availableDegreesStart: 0,
			availableDegreesEnd: 359,
		});

		const { maxX, minX, maxY, minY } = unadjustedNodes.reduce<{
			maxX: number;
			minX: number;
			maxY: number;
			minY: number;
		}>(
			(acc, curr) => ({
				maxX:
					curr?.type !== 'node'
						? acc.maxX
						: Math.max(acc.maxX, curr.x),
				minX:
					curr?.type !== 'node'
						? acc.minX
						: Math.min(acc.minX, curr.x),
				maxY:
					curr?.type !== 'node'
						? acc.maxY
						: Math.max(acc.maxY, curr.y),
				minY:
					curr?.type !== 'node'
						? acc.minY
						: Math.min(acc.minY, curr.y),
			}),
			{ maxX: 0, minX: 1, maxY: 0, minY: 1 },
		);

		const widestX = Math.max(maxX, 1 - minX);
		const widestY = Math.max(maxY, 1 - minY);

		const rangeX = widestX - (1 - widestX);
		const rangeY = widestY - (1 - widestY);

		const adjustX = (x: number, size: number) => {
			return (
				div.clientWidth * 0.1 +
				(rangeX ? (x - (1 - widestX)) / rangeX : 0.5) *
					div.clientWidth *
					0.8 -
				size
			);
		};

		const adjustY = (y: number, nodeSize: number) => {
			return (
				div.clientHeight * 0.1 +
				(rangeY ? (y - (1 - widestY)) / rangeY : 0.5) *
					div.clientHeight *
					0.8 -
				nodeSize / 2
			);
		};

		return unadjustedNodes
			.map(node => {
				if (isTypeNode(node)) {
					return {
						...node,
						x: adjustX(node.x, node.size),
						y: adjustY(node.y, node.size),
					};
				}
				if (isTypeConnector(node)) {
					return {
						...node,
						start: {
							...node.start,
							x: adjustX(node.start.x, node.start.size),
							y: adjustY(node.start.y, node.start.size),
						},
						end: {
							...node.end,
							x: adjustX(node.end.x, node.end.size),
							y: adjustY(node.end.y, node.end.size),
						},
					};
				}

				return undefined;
			})
			.filter(isNotUndefined);
	},
	1000,
	{ trailing: true, leading: true },
);

export const isTypeNode = (
	node: LayoutNode | LayoutConnector | undefined,
): node is LayoutNode => {
	return node?.type === 'node';
};

export const isTypeConnector = (
	node: LayoutNode | LayoutConnector | undefined,
): node is LayoutConnector => {
	return node?.type === 'connector';
};

const isNotUndefined = (
	node: LayoutNode | LayoutConnector | undefined,
): node is LayoutConnector | LayoutNode => {
	return !!node;
};
