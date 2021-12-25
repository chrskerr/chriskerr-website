import { ReactElement } from 'react';

import type { ProbablyValidUrl } from 'lib/scraper/src';

type GraphNodeProps = {
	x: number;
	y: number;
	size: number;
	href: ProbablyValidUrl;
	colour: string;
};

export default function GraphNode({
	x,
	y,
	size,
	href,
	colour,
}: GraphNodeProps): ReactElement {
	const styles = {
		top: y,
		left: x,
		width: size,
		height: size,
		borderColor: colour,
	};

	return (
		<div
			style={styles}
			className="absolute z-10 transition-all duration-1000 bg-white border-2 rounded-full ease-back-out group"
		>
			<div className="relative hidden w-full h-full group-hover:block">
				<div
					style={{ transform: 'translateZ(1px)' }}
					className="absolute z-30 px-4 py-3 bg-white border rounded shadow-lg bottom-1/2 left-1/2 group-hover:block"
				>
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
}
