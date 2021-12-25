import { ReactElement } from 'react';
import type { LayoutNode } from 'types/website-graph';

type GraphConnectorProps = {
	start: LayoutNode;
	end: LayoutNode;
};

export default function GraphConnector({
	start,
	end,
}: GraphConnectorProps): ReactElement {
	const x1 = start.x + start.size / 2;
	const y1 = start.y + start.size / 2;

	const x2 = end.x + end.size / 2;
	const y2 = end.y + end.size / 2;

	const width = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
	const degrees = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

	const left = x1;
	const top = y1;

	const styles = {
		top,
		left,
		width,
		transform: `rotate(${degrees}deg)`,
	};

	return (
		<div
			style={styles}
			className="absolute transition-all duration-1000 origin-left h-[1px] z-0 ease-back-out bg-stone-600"
		></div>
	);
}
