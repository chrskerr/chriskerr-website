import type { ProbablyValidUrl } from 'lib/scraper/src';

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
	start: LayoutNode;
	end: LayoutNode;
};
