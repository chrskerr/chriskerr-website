import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = async ({ url, request }) => {
	if (request.method === 'GET') {
		const delay = Math.max(
			Math.min(Number(url.searchParams.get('delay')) || 1, 30),
			0,
		);

		await new Promise<void>(resolve => {
			setTimeout(() => {
				resolve();
			}, delay * 1000);
		});
	}

	return new Response(null, {
		headers: new Headers({
			'access-control-allow-origin': '*',
			'access-control-allow-methods': '*',
		}),
	});
};
