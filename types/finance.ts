import { Nominal } from './nominal';

export type Cents = Nominal<number, 'Cents'>;
export type Dollars = Nominal<number, 'Dollars'>;

export function toCents(input: number): Cents {
	return input as Cents;
}

export function toDollars(input: number): Dollars {
	return input as Dollars;
}

export type UpApiReturn = {
	balances: ChartData[];
	cashFlow: ChartData[];
	expenses: {
		all: ChartData[];
		byParent: ChartData[];
		byCategory: ChartData[];
	};
	savers: ChartData[];
};

export type Account = {
	id: string;
	name: string;
	bankName: 'up' | 'nab';
	excludeFromCalcs: boolean;
};

export type MigrationVersion = {
	id: 1;
	version: Date;
};

export type Balance = {
	id: number;
	/** balances in cents */
	balance: Cents;
	createdAt: Date;
	accountId: string;
};

export type Transaction = {
	id: number;
	transactionId: string | null;
	/** transaction value in cents */
	amount: Cents;
	category: string | undefined;
	parentCategory: string | undefined;
	description: string;
	accountId: string;
	createdAt: string;
	isTransfer: boolean;
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

export type ChartData = {
	startDate: string;
	[key: string]: number | string;
};

export type ReportNabBody = {
	savingsDollars: Dollars;
	loanDollars: Dollars;
	redrawDollars: Dollars;
};

export type Saver = {
	id: number;
	name: string;
};

export type SaverTransaction = {
	id: number;
	saverId: number;
	amountCents: Cents;
	createdAt: Date;
};

export const redrawAccountId = 'nab-redraw';
