export enum TagName {
	REACT = 'React',
	SVELTE = 'Svelte',
	SVELTE_KIT = 'SvelteKit',
	TYPESCRIPT = 'Typescript',
	JAVASCRIPT = 'Javascript',
	SERVICE_WORKERS = 'Service workers',
	NODE = 'Node',
	GRAPHQL = 'GraphQL',
	POSTGRES = 'Postgres',
	NEXT = 'Next',
	THREE_JS = 'Three.js',
	STRIPE = 'Stripe',
}

export function tagToCssClass(tag: TagName): string {
	return tag.toLowerCase().replaceAll(/\W/g, '-');
}

const tagValues = Object.values(TagName);
function createHsl(index: number): string {
	const hue = Math.floor((360 * index) / tagValues.length);
	return `hsl(${hue}deg 32.5% 45%)`;
}

export const tagsCss = tagValues
	.map((tag, i) => {
		return `.${tagToCssClass(tag)} {background-color: ${createHsl(i)}}`;
	})
	.join('\n');
