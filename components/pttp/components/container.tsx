import { ReactNode } from 'react';
import { useTimer } from '../hooks/timing';

export function Container({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	const { timeString, isRunning, start, restart, stop } = useTimer();

	function handleToggle(open: boolean) {
		if (open) {
			if (!isRunning) start();
			else restart();
		} else {
			stop();
		}
	}

	return (
		<details
			className="mb-8"
			open={false}
			onToggle={e => handleToggle(e.currentTarget.open)}
		>
			<summary className="mb-2 text-xl sm:text-2xl">
				{label}
				<time className="ml-2 text-base">{timeString}</time>
			</summary>
			{children}
		</details>
	);
}
