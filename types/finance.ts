export type UpApiReturn = {
	balances: BalanceWithStart[];
	accounts: Account[];
	allTransactions: TransactionsSummary[];
	transactionsByParentCategory: TransactionsSummary[];
	transactionsByCategory: TransactionsSummary[];
};

export type Account = {
	id: string;
	name: string;
};

export type Balance = {
	id: number;
	/** balances in cents */
	balance: number;
	createdAt: Date;
	accountId: string;
};

export type BalanceWithStart = Balance & { weekStartOn: Date };

export type Transaction = {
	id: number;
	/** transaction value in cents */
	amount: number;
	category: string | undefined;
	parentCategory: string | undefined;
	description: string;
	accountId: string;
	createdAt: string;
};

export type TransactionsSummary = {
	weekStartOn: Date;
	accountId: string;
	/** transaction value in cents */
	amount: number;
	category?: string;
	parentCategory?: string;
};

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

export type UpTransaction = {
	data: {
		type: 'transactions';
		id: string;
		attributes: {
			description: string;
			message: null;
			amount: {
				currencyCode: string;
				valueInBaseUnits: number;
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
			category: {
				data: null | { id: string };
			};
			parentCategory: {
				data: null | { id: string };
			};
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
			valueInBaseUnits: number;
		};
	};
};
