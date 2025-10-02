This folder contains manual SQL migration files for schema changes. Use your preferred migration tool (drizzle, knex, or raw psql) to apply them to production.

0004_add_connections_and_dm_privacy.sql
 - Adds `dm_privacy` column to `users` (default 'everyone').
 - Creates `connections` table to model friend/follower relationships with statuses: pending, accepted, blocked.

Notes:
 - If you use Drizzle's migration system, convert the SQL into a Drizzle migration file or run the SQL directly against your database.
 - Make sure to run migrations in a maintenance window if you have heavy traffic.
