import { Express } from 'express';

import axios from 'axios';

import { limiter } from '../helpers';

const upApiKeyChris = process.env.UP_API_KEY;
const upApiKeyKate = process.env.UP_API_KEY_KATE;

const upApiKey = upApiKeyChris ?? upApiKeyKate;

const urlBase = 'https://api.up.com.au/api/v1';

export function createUpAdminRoutes(app: Express): void {
	app.get('/up/ping/:id', limiter, async (req, res, next) => {
		try {
			if (apiKey) {
				const id = req.params.id;
				await axios.post(urlBase + `/webhooks/${id}/ping`, {
					headers: { Authorization: `Bearer ${upApiKey}` },
				});
			}
			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.get('/up/list', limiter, async (req, res, next) => {
		try {
			if (apiKey) {
				const fetchRes = await axios.get(urlBase + '/webhooks', {
					headers: { Authorization: `Bearer ${upApiKey}` },
				});
				fetchRes.data?.data?.forEach(
					(row: { id: string; attributes: string }) => {
						console.log(row.id, row.attributes);
					},
				);
			}
			res.status(200).end();
		} catch (e) {
			console.log(e);
			next(e);
		}
	});

	app.get('/up/create/:url', limiter, async (req, res, next) => {
		const url = req.params.url;
		console.log(url);
		try {
			if (apiKey) {
				const fetchRes = await axios.post(urlBase + '/webhooks', {
					data: {
						attributes: {
							url,
						},
					},
					headers: { Authorization: `Bearer ${upApiKey}` },
				});
				console.log(fetchRes.data);
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.get('/up/delete/:id', limiter, async (req, res, next) => {
		const id = req.params.id;
		try {
			if (apiKey) {
				const fetchRes = await axios.delete(
					urlBase + '/webhooks/' + id,
					{ headers: { Authorization: `Bearer ${upApiKey}` } },
				);
				console.log(fetchRes.data);
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});

	app.get('/up/txns', limiter, async (req, res, next) => {
		try {
			if (apiKey) {
				const fetchRes = await axios.get(urlBase + '/transactions', {
					headers: { Authorization: `Bearer ${upApiKey}` },
				});
				console.log(fetchRes.data);
			}

			res.status(200).end();
		} catch (e) {
			next(e);
		}
	});
}
