import { Knex } from 'knex';
import { Balance, MigrationVersion } from '../types/finance';

export enum TableNames {
	NOTES = 'notes',
	ACCOUNTS = 'accounts',
	BALANCES = 'account_balances',
	TRANSACTIONS = 'account_transactions',
	MIGRATION_VERSION = 'migration_version',
	SAVERS = 'savers',
	SAVER_TRANSACTIONS = 'saver_transactions',
}

async function setMigrationVersion(knex: Knex, version: Date): Promise<void> {
	await knex
		.table<MigrationVersion>(TableNames.MIGRATION_VERSION)
		.insert({ id: 1, version })
		.onConflict('id')
		.merge();
}

async function getMigrationVersion(knex: Knex): Promise<Date | null> {
	const migrationVersion = await knex
		.table<MigrationVersion>(TableNames.MIGRATION_VERSION)
		.where({ id: 1 })
		.select('*')
		.first();
	return migrationVersion?.version ?? null;
}

export const migrate = async (knex: Knex): Promise<void> => {
	const hasNotesTable = await knex.schema.hasTable(TableNames.NOTES);
	if (!hasNotesTable) {
		await knex.schema.createTable(TableNames.NOTES, table => {
			table.text('id').unique().index();
			table.jsonb('data').notNullable();
		});
	}

	const hasAccountsTable = await knex.schema.hasTable(TableNames.ACCOUNTS);
	if (!hasAccountsTable) {
		await knex.schema.createTable(TableNames.ACCOUNTS, table => {
			table.text('id').unique().index();
			table.text('name').notNullable();
		});
	}

	const hasBalancesTable = await knex.schema.hasTable(TableNames.BALANCES);
	if (!hasBalancesTable) {
		await knex.schema.createTable(TableNames.BALANCES, table => {
			table.increments('id');
			table.integer('balance').notNullable();
			table.dateTime('createdAt').defaultTo(knex.fn.now());

			table.text('accountId').notNullable();
			table.foreign('accountId').references(TableNames.ACCOUNTS + '.id');
		});
	}

	const hasTransactionsTable = await knex.schema.hasTable(
		TableNames.TRANSACTIONS,
	);
	if (!hasTransactionsTable) {
		await knex.schema.createTable(TableNames.TRANSACTIONS, table => {
			table.increments('id');

			table.integer('amount').notNullable();
			table.dateTime('createdAt').defaultTo(knex.fn.now());

			table.text('category').nullable();
			table.text('parentCategory').nullable();
			table.text('description').nullable();

			table.text('accountId').notNullable();
			table.foreign('accountId').references(TableNames.ACCOUNTS + '.id');
		});
	}

	const hasTransactionId = await knex.schema.hasColumn(
		TableNames.TRANSACTIONS,
		'transactionId',
	);
	if (!hasTransactionId) {
		await knex.schema.alterTable(TableNames.TRANSACTIONS, table => {
			table.text('transactionId').nullable().unique();
		});
	}

	const hasTransactionIsTransfer = await knex.schema.hasColumn(
		TableNames.TRANSACTIONS,
		'isTransfer',
	);
	if (!hasTransactionIsTransfer) {
		await knex.schema.alterTable(TableNames.TRANSACTIONS, table => {
			table.boolean('isTransfer').defaultTo(false).index();
		});
	}

	const hasBankNameColumn = await knex.schema.hasColumn(
		TableNames.ACCOUNTS,
		'bankName',
	);
	if (!hasBankNameColumn) {
		await knex.schema.alterTable(TableNames.ACCOUNTS, table => {
			table.text('bankName').defaultTo('up').notNullable();
		});
	}

	const hasVersionTable = await knex.schema.hasTable(
		TableNames.MIGRATION_VERSION,
	);
	if (!hasVersionTable) {
		await knex.schema.createTable(TableNames.MIGRATION_VERSION, table => {
			table.increments();
			table.datetime('version').notNullable();
		});

		await setMigrationVersion(knex, new Date('2022-06-13'));
	}

	const migrationVersion = await getMigrationVersion(knex);
	if (!migrationVersion) return;

	await knex
		.table<Balance>(TableNames.BALANCES)
		.where('createdAt', '<=', new Date('2022-06-15'))
		.delete();

	if (migrationVersion < new Date('2022-06-14')) {
		await knex.schema.alterTable(TableNames.BALANCES, table => {
			table.unique(['createdAt', 'accountId']);
		});

		await knex.schema.createTable(TableNames.SAVERS, table => {
			table.increments('id');
			table.text('name').notNullable();
		});

		await knex.schema.createTable(TableNames.SAVER_TRANSACTIONS, table => {
			table.increments('id');

			table.integer('saverId').notNullable();
			table.foreign('saverId').references(`${TableNames.SAVERS}.id`);

			table.integer('amountCents').notNullable();
			table.datetime('createdAt').notNullable().defaultTo(knex.fn.now());
		});

		await setMigrationVersion(knex, new Date('2022-06-14'));
	}

	if (migrationVersion < new Date('2022-06-15')) {
		const hasColumn = await knex.schema.hasColumn(
			TableNames.ACCOUNTS,
			'excludeFromCalcs',
		);
		// I missed the migration bump last time, so now have to check twice 🤦‍♂️
		if (!hasColumn) {
			await knex.schema.alterTable(TableNames.ACCOUNTS, table => {
				table
					.boolean('excludeFromCalcs')
					.notNullable()
					.defaultTo(false);
			});
		}
		await setMigrationVersion(knex, new Date('2022-06-15'));
	}
};
