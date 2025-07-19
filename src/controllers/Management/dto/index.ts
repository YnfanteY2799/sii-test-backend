import { t } from "elysia";

export const CreateSingleCardDTO = t.Object({});

export const GetAllQueryParams = t.Object({
	limit: t.Number({ default: 10 }),
	page: t.Number({ default: 1 }),
	search: t.Optional(t.String()),
});
