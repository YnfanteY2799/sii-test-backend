import { pgTable, integer, varchar, text, boolean, timestamp, serial, smallint, smallserial, index, foreignKey } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel, relations, Relations } from "drizzle-orm";
import generateNanoID from "@/utils/nanoId";

/*** Reference Tables */
export const cardType = pgTable(
	"card_type",
	{
		id: smallserial().primaryKey(),
		name: varchar("name", { length: 255 }).notNull().unique(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(() => new Date()),
	},
	({ id }) => [index("card_type_id_idx").on(id)]
);

export const cards = pgTable(
	"cards",
	{
		id: varchar("id", { length: 255 })
			.primaryKey()
			.$defaultFn(() => generateNanoID(24)),
		holder_name: varchar("holder_name", { length: 255 }).notNull(),
		card_number: varchar("card_number", { length: 255 }).notNull(),
		exprirement_date: timestamp("exprirement_date", { withTimezone: true }).notNull(),
		card_cvv: varchar("card_cvv", { length: 4 }).notNull(),
		cardTypeId: smallint("cardTypeId").notNull().default(1),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(() => new Date()),
	},
	(table) => [index("cards_id_idx").on(table.id)]
);
