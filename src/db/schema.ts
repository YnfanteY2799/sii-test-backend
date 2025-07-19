import { pgTable, integer, varchar, text, boolean, timestamp, serial, smallint, smallserial, index, foreignKey } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel, relations, Relations } from "drizzle-orm";
import generateNanoID from "@/utils/nanoId";

/*** Reference Tables */
export const userStatus = pgTable(
	"user_status",
	{
		id: smallserial().primaryKey(),
		name: varchar("name", { length: 255 }).notNull().unique(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(() => new Date()),
	},
	({ id }) => [index("user_status_id_idx").on(id)]
);
