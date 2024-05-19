import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
	if (request.method !== 'GET') {
		return new Response(null, { status: 405 });
	}

	const response =
		Math.random() > 0.7
			? 'Rest day'
			: `${((Math.random() * 3) | 0) + 3} sets. ${
					Math.random() > 0.5 ? 'One' : 'Two'
			  } handed. Sets of ${Math.random() > 0.5 ? 5 : 10}`;

	return new Response(response, {
		headers: { 'cache-control': 'public, max-age=0, must-revalidate' },
	});
};
