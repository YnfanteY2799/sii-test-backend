import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { databaseUri } from "@/utils/consts/env.ts";
import * as schema from "./schema.ts";
import Pool from "postgres";

const pool = Pool(databaseUri, {
	max: 100,
	debug: false,
	idle_timeout: 20,
	keep_alive: 10000,
	connect_timeout: 60,
	connection: {
		statement_timeout: 10000,
		application_name: "empleasy_app",
		idle_in_transaction_session_timeout: 20000,
	},
	ssl: { rejectUnauthorized: false },
});

export const db: PostgresJsDatabase<typeof schema> = drizzle(pool, { logger: false, schema });

export * from "./schema.ts";
