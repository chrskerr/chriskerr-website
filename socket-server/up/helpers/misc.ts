import { Transaction } from '../../types';
import { Request } from 'express';
import rateLimit from 'express-rate-limit';

export const apiKey = process.env.API_KEY || '';
export const upApiKeyChris = process.env.UP_API_KEY;
export const upApiKeyKate = process.env.UP_API_KEY_KATE;

type AcceptedEventTypes = 'TRANSACTION_CREATED';

export const urlBase = 'https://api.up.com.au/api/v1';

export const isEventType = (string: string): string is AcceptedEventTypes => {
	return string === 'TRANSACTION_CREATED';
};

export const isProbablyTransfer = (transaction: Transaction): boolean =>
	transaction.isTransfer ||
	isDescriptionTransferLike(transaction.description);

export const isDescriptionTransferLike = (description: string): boolean =>
	description.startsWith('Transfer from ') ||
	description.startsWith('Transfer to ') ||
	description.startsWith('Forward from ') ||
	description.startsWith('Forward to ') ||
	description === 'Chris Kerr' ||
	description.startsWith('Auto Transfer to ') ||
	description === 'Round Up';

export const isProbablyInvestment = (transaction: Transaction): boolean =>
	!!transaction.category?.includes('investment');

export const getHasAuthHeaders = (req: Request): boolean => {
	return req.headers['api_key'] === (apiKey || process.env.API_KEY);
};

export const limiter = rateLimit({
	windowMs: 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
});
