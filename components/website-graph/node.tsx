import { memo, ReactElement } from 'react';

import type { ProbablyValidUrl } from 'lib/scraper/src';

type GraphNodeProps = {
	x: number;
	y: number;
	size: number;
	href: ProbablyValidUrl;
};

const GraphNode = memo(function GraphNode({
	x,
	y,
	size,
	href,
}: GraphNodeProps): ReactElement {
	const styles = {
		top: y,
		left: x,
		width: size,
		height: size,
	};

	return (
		<div
			style={styles}
			className="absolute transition-all duration-1000 rounded-full ease-back-out bg-brand-dark group"
		>
			<div className="relative hidden w-full h-full group-hover:block">
				<div className="absolute z-10 px-4 py-3 bg-white border rounded shadow-lg bottom-1/2 left-1/2 group-hover:block">
					<a
						href={href}
						target="_blank"
						className="hover:underline text-brand"
						rel="noreferrer"
					>
						{href}
					</a>
				</div>
			</div>
		</div>
	);
});

export default GraphNode;
