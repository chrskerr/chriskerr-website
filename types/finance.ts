import { Nominal } from './nominal';

export type Cents = Nominal<number, 'Cents'>;
export type Dollars = Nominal<number, 'Dollars'>;

export function toCents(input: number): Cents {
	return Number(input.toFixed(0)) as Cents;
}

export function toDollars(input: number): Dollars {
	return Number(input.toFixed(0)) as Dollars;
}

export function convertDollarsToCents(dollars: Dollars): Cents {
	return toCents(dollars * 100);
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
	saverNames: {
		id: number;
		name: string;
		archivedAt: Date | null;
	}[];
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

export interface ISaversTransactBody {
	id: number | null;
	name: string | null;
	amount: Dollars;
}

export const redrawAccountId = 'nab-redraw';
