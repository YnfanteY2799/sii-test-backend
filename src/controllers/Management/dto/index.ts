import { t } from "elysia";

export const CreateSingleCardDTO = t.Object({
	holder_name: t.String({ minLength: 2 }),
	card_number: t.String({ minLength: 16 }),
	expiration_date: t.String(),
	card_cvv: t.String({ minLength: 3, maxLength: 3 }),
});

export const GetAllQueryParams = t.Object({
	limit: t.Number({ default: 10 }),
	page: t.Number({ default: 1 }),
	search: t.Optional(t.String()),
});
