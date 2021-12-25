import { ReactElement } from 'react';
import { size } from './helpers';

type GraphConnectorProps = {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
};

export default function GraphConnector({
	startX,
	startY,
	endX,
	endY,
}: GraphConnectorProps): ReactElement {
	const width = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
	const degrees = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

	const left = startX + size / 2;
	const top = startY + size / 2;

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
