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

const colourNames = Object.values(TagName);
export const colours = new Map(
	colourNames.map((color, i) => [
		color as string,
		`hsl(${Math.floor((360 * i) / colourNames.length)}deg 32.5% 45%)`,
	]),
);

type Employment = {
	start: string;
	end?: string;
	title: string;
	business?: string;
	description: string[];
	tags: [TagName, ...TagName[]];
};

export const employment_history: Employment[] = [
	{
		start: 'April 2023',
		title: 'Software Engineer',
		business: 'Canva',
		tags: [TagName.TYPESCRIPT, TagName.REACT, TagName.SERVICE_WORKERS],
		description: [
			'Frontend developer for Canva.',
			'We are working to bring Offline functionality to the Canva suite, allowing users to continue working while temporarily offline.',
		],
	},
	{
		start: 'October 2021',
		end: 'March 2023',
		title: 'Software Engineer',
		business: 'Functionly',
		tags: [
			TagName.SVELTE,
			TagName.SVELTE_KIT,
			TagName.TYPESCRIPT,
			TagName.NODE,
			TagName.GRAPHQL,
			TagName.POSTGRES,
		],
		description: [
			'I was a fullstack software engineer at Functionly, developing a web application that helps businesses optimise their organisational structure.',
			'In my role, I lead new feature planning and releases, drive innovation, shape architecture, and conduct rigorous testing. My expertise allows for successful deployment and consistent maintenance of our platform while ensuring great user experiences. I quickly and efficiently address bugs and breakage issues to maintain operational efficiency.',
			'In order to give back to the Svelte community I also worked in my own time to create a handful of patch contributions back into the Svelte ecosystem, enabling all users of the framework to benefit from work that I had done to enable advanced needs at Functionly.',
		],
	},
	{
		start: 'February 2021',
		end: 'October 2021',
		title: 'Software Developer & travelling',
		tags: [
			TagName.TYPESCRIPT,
			TagName.NEXT,
			TagName.STRIPE,
			TagName.THREE_JS,
		],
		description: [
			'My partner and I worked as contractors during this period while we travelling around east coast Australia living our van 🚚.',
		],
	},
	{
		start: 'January 2020',
		end: 'February 2021',
		title: 'Software Developer',
		business: 'Sportility',
		tags: [
			TagName.REACT,
			TagName.POSTGRES,
			TagName.GRAPHQL,
			TagName.NODE,
			TagName.JAVASCRIPT,
		],
		description: [
			'I worked as a software developer with an organised sports team uniforms/gear startup.',
			'We managed a customer facing React application, which enabled customers to 3d design their uniforms, share, purchase and plan their seasons; and an internal dashboard (also React) which was used to manage leads, sales, operations, customer service, financial reporting, and most of the remaining business process.',
			'We primarily used Hasura Graphql as our backend, with node services as custom resolvers for any specific business logic required.',
		],
	},
];
