export enum TagName {
	TYPESCRIPT = 'Typescript',
	JAVASCRIPT = 'Javascript',
	SVELTE = 'Svelte',
	SVELTE_KIT = 'SvelteKit',
	ASTRO = 'Astro',
	REACT = 'React',
	NEXT = 'Next.js',
	NODE = 'Node',
	SERVICE_WORKERS = 'Service workers',
	AI = 'AI',
	JAVA = 'Java',
	PYTHON = 'Python',
	GRAPHQL = 'GraphQL',
	POSTGRES = 'Postgres',
	THREE_JS = 'Three.js',
	STRIPE = 'Stripe',
}

export function tagToCssClass(tag: TagName): string {
	return tag.toLowerCase().replaceAll(/\W/g, '-');
}

const tagValues = Object.values(TagName).sort((a, b) => {
	if (a.length !== b.length) {
		return a.length - b.length;
	}
	return a.localeCompare(b);
});

function createOklch(index: number): string {
	const hue = (360 * index) / tagValues.length;
	return `oklch(0.65 0.15 ${hue})`;
}

export const tagsCss = tagValues
	.map((tag, i) => {
		return `.${tagToCssClass(tag)} {background-color: ${createOklch(i)}}`;
	})
	.join('\n');
