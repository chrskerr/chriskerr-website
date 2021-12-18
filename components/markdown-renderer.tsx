
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

interface Props { 
	markdown: string,
}

export default function MarkdownRenderer ({ markdown }: Props ) {
	const __html = sanitizeHtml(
		marked.parse( markdown ),
	);

	return (
		<span className="w-full prose" dangerouslySetInnerHTML={{ __html }} />
	);
}