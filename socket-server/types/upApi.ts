import { Cents } from '../../types/finance';

export type UpWebhook = {
	id: string;
	attributes: {
		eventType: string;
	};
	relationships: {
		transaction?: {
			data?: {
				id?: string;
			};
		};
	};
};

export type UpTransactions = {
	data: UpTransaction[];
	links: {
		prev?: string;
		next?: string;
	};
};

export type UpTransaction = {
	type: 'transactions';
	id: string;
	attributes: {
		description: string;
		message: null;
		amount: {
			currencyCode: string;
			valueInBaseUnits: Cents;
		};
		/** ISO8601 date string */
		settledAt: string;
		/** ISO8601 date string */
		createdAt: string;
	};
	relationships: {
		account: {
			data: {
				type: 'accounts';
				id: string;
			};
		};
		transferAccount: {
			data: {
				type: 'accounts';
				id: string;
			} | null;
		};
		category: {
			data: null | { id: string };
		};
		parentCategory: {
			data: null | { id: string };
		};
	};
};

export type UpAccounts = {
	data: UpAccount[];
};

export type UpAccount = {
	type: 'accounts';
	id: string;
	attributes: {
		displayName: string;
		balance: {
			valueInBaseUnits: Cents;
		};
	};
};
