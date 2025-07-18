import { TagName } from './tag_names';

type Work = {
	start: string;
	end?: string;
	title: string;
	business?: string;
	business_href?: string;
	description: string[];
	tags: TagName[];
};

export const work_history: Work[] = [
	{
		start: 'April 2023',
		title: 'Senior Software Engineer & Software Engineer',
		business: 'Canva',
		business_href: 'https://www.canva.com',
		tags: [TagName.TYPESCRIPT, TagName.REACT, TagName.SERVICE_WORKERS],
		description: [
			'I am working to enable the use of Canva while offline.',
			'This has required touching most aspects of the Canva platform, such as: how the app is bundled; how Javascript, CSS, images, etc, are cached; how user data is cached (and their privacy protected); offline page loading using a service worker; analysing the performance of our features; and much more.',
			'This has been a research heavy project due to the complexity of the problem and the breadth of features within Canva.',
		],
	},
	{
		start: 'October 2021',
		end: 'March 2023',
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
			'I was a fullstack software engineer at Functionly, developing a web application that helps businesses to optimise their organisational structure.',
			'In the role, I led new feature planning and releases, drove innovation, shaped architecture, and conducted rigorous testing.',
			'In order to give back to the Svelte community I also worked in my own time to create a handful of patch contributions back into the Svelte ecosystem.',
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
			TagName.SVELTE,
			TagName.NODE,
			TagName.THREE_JS,
			TagName.JAVASCRIPT,
		],
		description: [
			'I worked as a freelance Typescript Dev while travelling around east coast Australia living in our van 🚚.',
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
			'We managed a customer facing React application, which enabled customers to 3d design their uniforms, share, purchase and plan their seasons; and an internal dashboard which was used to manage leads, sales, operations, customer service, financial reporting, and most of the remaining business process.',
			'We primarily used Hasura Graphql as our backend, with node services as custom resolvers for any specific business logic required.',
		],
	},
	{
		start: 'September 2019',
		end: 'January 2020',
		title: 'Student',
		business: 'General Assembly',
		tags: [TagName.REACT, TagName.JAVASCRIPT, TagName.NODE],
		description: ['I studied Javascript, React, Node, and Ruby.'],
	},
	{
		start: 'November 2017',
		end: 'September 2019',
		title: 'Account Manager',
		business: 'Hewlett Packard Enterprise',
		business_href: 'https://www.hpe.com',
		tags: [],
		description: [],
	},
	{
		start: 'October 2016',
		end: 'November 2017',
		title: 'Backpacker',
		tags: [],
		description: [
			'🎒🌏',
			'Travelled through Asia, Europe and a little bit of USA.',
		],
	},
	{
		start: 'September 2013',
		end: 'October 2016',
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
