import { BlogData } from 'types/writing';

const markdown = `
We use Knex to manage our postgres database, both from a migrations and querying point of view. It's highly composable and largely covers all of our requirements without too much mucking around, so it's been a solid choice so far.

But we are moving towards an issue with our perpetually growing stack of database migrations. We are current at ~145.

The execution of these isn't too bad; my primary worry is the disconnect between these migrations and the desired-state of the database. We capture this separately in model files but there are now two "sources of truth" for the database.

1. The migrations, cumulatively
2. The model files 

Hopefully these remain in sync 🤞

The model files allow us to "audit" a table to understand the data which it holds and should hold, and we typically refer to these when making data design decisions, but they are missing some key pieces of information:

- indexes
- unique keys
- constraints, including on-delete / on-update 

Ideally, I would like to be able to periodically squash all the database migrations into a single "init" migration which can be used to configure a new database.
`;

export const knexMigrations: BlogData = {
	title: 'Squashing old Knex migrations',
	description: 'Cleaning up old Knex migrations',

	tags: ['code', 'knex', 'database', 'migrations', 'cleanup'],

	markdown,

	createdAt: new Date('2022-11-30'),
	modifiedAt: new Date('2022-11-30'),
};
