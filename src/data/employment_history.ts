enum Tag {
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

type Employment = {
	start: string;
	end?: string;
	title: string;
	business?: string;
	description: string[];
	tags: [Tag, ...Tag[]];
};

export const employment_history: Employment[] = [
	{
		start: 'April 2023',
		title: 'Software Engineer',
		business: 'Canva',
		tags: [Tag.TYPESCRIPT, Tag.REACT, Tag.SERVICE_WORKERS],
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
			Tag.SVELTE,
			Tag.SVELTE_KIT,
			Tag.TYPESCRIPT,
			Tag.NODE,
			Tag.GRAPHQL,
			Tag.POSTGRES,
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
		tags: [Tag.TYPESCRIPT, Tag.NEXT, Tag.STRIPE, Tag.THREE_JS],
		description: [
			'My partner and I worked as contractors during this period while we travelling around east coast Australia living our van 🚚.',
		],
	},
	{
		start: 'January 2020',
		end: 'February 2021',
		title: 'Software Developer',
		business: 'Sportility',
		tags: [Tag.REACT, Tag.POSTGRES, Tag.GRAPHQL, Tag.NODE, Tag.JAVASCRIPT],
		description: [
			'I worked as a software developer with an organised sports team uniforms/gear startup.',
			'We managed a customer facing React application, which enabled customers to 3d design their uniforms, share, purchase and plan their seasons; and an internal dashboard (also React) which was used to manage leads, sales, operations, customer service, financial reporting, and most of the remaining business process.',
			'We primarily used Hasura Graphql as our backend, with node services as custom resolvers for any specific business logic required.',
		],
	},
];
