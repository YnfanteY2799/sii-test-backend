import { InternalServerErrorException } from "@/utils/error";
import { type SQL, count, sql, and, eq } from "drizzle-orm";
import { db, cards, cardType } from "@/db/index.ts";
import { GetAllQueryParams } from "../dto/index.ts";

import { Elysia } from "elysia";

export default new Elysia().get(
	"GetAll",
	async ({ query }) => {
		// Sugar Destructuring
		const { page, limit, search } = query;

		// Validate pagination parameters
		const validPage = Math.max(1, page);
		const validLimit = Math.min(Math.max(1, limit), 100);
		const offset = (validPage - 1) * validLimit;

		try {
			// Build base query conditions
			const whereConditions: Array<SQL> = [];

			if (search) {
				whereConditions.push(
					sql`(
          ${cards.holder_name} ILIKE ${"%" + search + "%"} OR 
          RIGHT(${cards.card_number}, 4) ILIKE ${"%" + search + "%"}
        )`
				);
			}

			// Get total count
			const [{ count: total }] = await db
				.select({ count: count() })
				.from(cards)
				.where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

			const totalPages = Math.ceil(total / validLimit);

			const data = await db
				.select({
					id: cards.id,
					card_cvv: cards.card_cvv,
					cardTypeId: cards.cardTypeId,
					holder_name: cards.holder_name,
					card_number: cards.card_number,
					expirement_date: cards.expirement_date,
					cardType: { id: cardType.id, name: cardType.name },
				})
				.from(cards)
				.leftJoin(cardType, eq(cards.cardTypeId, cardType.id))
				.where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
				.limit(validLimit)
				.offset(offset);

			return {
				data,
				pagination: {
					total,
					totalPages,
					page: validPage,
					limit: validLimit,
					hasPrev: validPage > 1,
					hasNext: validPage < totalPages,
				},
			};
		} catch (err) {
			console.error(err);
			throw new InternalServerErrorException(err ? (err as Error).message : "Error del lado del servidor");
		}
	},
	{ query: GetAllQueryParams }
);
