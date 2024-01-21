import { TagName } from './tag_names';

export type Dateish = `${number}${number}/${number}${number}${number}${number}`;

type Work = {
	start: Dateish;
	end?: Dateish;
	title: string;
	business?: string;
	business_href?: string;
	description: string[];
	tags: TagName[];
};

export const work_history: Work[] = [
	{
		start: '04/2023',
		title: 'Software Engineer',
		business: 'Canva',
		business_href: 'https://www.canva.com',
		tags: [TagName.TYPESCRIPT, TagName.REACT, TagName.SERVICE_WORKERS],
		description: [
			'Frontend developer for Canva.',
			'We are working to bring Offline functionality to the Canva suite, allowing users to continue working while temporarily offline.',
		],
	},
	{
		start: '10/2021',
		end: '03/2023',
		title: 'Software Engineer',
		business: 'Functionly',
		business_href: 'https://www.functionly.com',
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
		start: '02/2021',
		end: '10/2021',
		title: 'Software Developer & travelling',
		tags: [
			TagName.TYPESCRIPT,
			TagName.NEXT,
			TagName.STRIPE,
			TagName.SVELTE,
			TagName.NODE,
			TagName.THREE_JS,
			TagName.JAVASCRIPT,
		],
		description: [
			'I worked as a freelance Typescript Dev while travelling around east coast Australia living our van 🚚.',
		],
	},
	{
		start: '01/2020',
		end: '02/2021',
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
	{
		start: '09/2019',
		end: '01/2020',
		title: 'Student',
		business: 'General Assembly',
		tags: [TagName.REACT, TagName.JAVASCRIPT, TagName.NODE],
		description: ['Learnt Javascript, React, Node, and Ruby.'],
	},
	{
		start: '11/2017',
		end: '09/2019',
		title: 'Account Manager',
		business: 'Hewlett Packard Enterprise',
		business_href: 'https://www.hpe.com',
		tags: [],
		description: [],
	},
	{
		start: '10/2016',
		end: '11/2017',
		title: 'Backpacker',
		tags: [],
		description: [
			'🎒🌏',
			'Travelled through Asia, Europe and a little bit of USA.',
		],
	},
	{
		start: '09/2013',
		end: '10/2016',
		title: 'Partner Account Manager & Partner Enablement',
		business: 'Cisco',
		business_href: 'https://www.cisco.com',
		tags: [],
		description: [
			'Partner Account Manager: March 2015 - October 2016',
			'Partner Enablement: September 2013 - March 2015',
		],
	},
];
