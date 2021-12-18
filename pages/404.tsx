
import type { ReactElement } from "react";

export default function NotFound (): ReactElement {
	return (
		<div className="display-width h-[40vh] flex flex-col justify-center items-center">
			<p className="mb-8 text-4xl font-code">404</p>
			<p className="text-xl font-code">Page not found</p>
		</div>
	);
}