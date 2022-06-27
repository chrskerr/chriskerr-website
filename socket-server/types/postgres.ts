import { Cents } from '../../types/finance';

export type Saver = {
	id: number;
	name: string;
	archivedAt: Date | null;
};

export type SaverTransaction = {
	id: number;
	saverId: number;
	amountCents: Cents;
	createdAt: Date;
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
	category: string | null;
	parentCategory: string | null;
	description: string;
	accountId: string;
	createdAt: Date;
	isTransfer: boolean;
};
