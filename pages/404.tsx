
import type { ReactElement } from "react";

export default function NotFound (): ReactElement {
	return (
		<div className="display-width h-[40vh] flex flex-col justify-center items-center">
			<p className="mb-8 font-mono text-4xl">404</p>
			<p className="font-mono text-xl">Page not found</p>
		</div>
	);
}