import { ReactNode } from 'react';

export function Container({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<details className="mb-8" open>
			<summary className="mb-2 text-2xl">{label}</summary>
			{children}
		</details>
	);
}
