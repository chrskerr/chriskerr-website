import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
	if (request.method !== 'GET') {
		return new Response(null, { status: 405 });
	}

	return new Response(
		`${((Math.random() * 3) | 0) + 3} sets.\n${
			Math.random() > 0.5 ? 'One' : 'Two'
		} handed.\nSets of ${Math.random() > 0.5 ? 5 : 10}.`,
		{
			headers: { 'cache-control': 'public, max-age=10800' },
		},
	);
};
