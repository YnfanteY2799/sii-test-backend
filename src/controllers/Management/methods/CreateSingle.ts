import { InternalServerErrorException } from "@/utils/error";
import { CreateSingleCardDTO } from "../dto/index.ts";
import { db } from "@/db/index.ts";

import { Elysia } from "elysia";

export default new Elysia().post(
	"Create",
	async ({ body }) => {
		// Sugar
		const { card_cvv, card_number, expiration_date, holder_name } = body;

		try {








      
		} catch (err) {
			console.error(err);
			throw new InternalServerErrorException(err ? (err as Error).message : "Error del lado del servidor");
		}
	},
	{ body: CreateSingleCardDTO }
);
