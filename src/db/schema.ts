import { pgTable, varchar, boolean, timestamp, smallint, smallserial, index, foreignKey } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel, relations } from "drizzle-orm";
import generateNanoID from "@/utils/nanoId";

export const cardType = pgTable(
	"card_type",
	{
		id: smallserial().primaryKey(),
		name: varchar("name", { length: 255 }).notNull().unique(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(() => new Date()),
	},
	(table) => [index("card_type_id_idx").on(table.id)]
);

export const cards = pgTable(
	"cards",
	{
		id: varchar("id", { length: 255 })
			.primaryKey()
			.$defaultFn(() => generateNanoID(24)),
		holder_name: varchar("holder_name", { length: 255 }).notNull(),
		card_number: varchar("card_number", { length: 255 }).notNull(),
		expirement_date: timestamp("expirement_date", { withTimezone: true }).notNull(), // Fixed typo
		card_cvv: varchar("card_cvv", { length: 4 }).notNull(),
		cardTypeId: smallint("card_type_id").notNull().default(1),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(() => new Date()),
	},
	({ id, cardTypeId }) => [
		index("cards_id_idx").on(id),
		foreignKey({ columns: [cardTypeId], foreignColumns: [cardType.id], name: "cards_card_type_id_fk" }),
	]
);

export const cardTypeRelations = relations(cardType, ({ many }) => ({ cards: many(cards) }));

export const cardsRelations = relations(cards, ({ one }) => ({
	cardType: one(cardType, { fields: [cards.cardTypeId], references: [cardType.id] }),
}));

export type CardType = InferSelectModel<typeof cardType>;
export type NewCardType = InferInsertModel<typeof cardType>;

export type Card = InferSelectModel<typeof cards>;
export type NewCard = InferInsertModel<typeof cards>;
