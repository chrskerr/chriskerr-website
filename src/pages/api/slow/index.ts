import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const delay = Math.max(
		Math.min(Number(url.searchParams.get('delay')) || 1, 30),
		0,
	);

	await new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, delay * 1000);
	});

	return new Response();
};
