import { defineConfig } from "drizzle-kit";

export default defineConfig({
	strict: true,
	verbose: true,
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	dbCredentials: { url: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: false } },
});
