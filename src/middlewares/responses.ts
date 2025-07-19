import { filterMessage } from "@/utils/functions";

import type { Elysia } from "elysia";

const commonHeaders = { "Cache-Control": "public, max-age=86400", "Content-Type": "application/json" };

export function successMiddleware(app: Elysia): Elysia {
	return app.onAfterHandle(async ({ set, request, response }): Promise<Response> => {
		const timeStamp = new Date().toISOString();
		const status = set.status ?? 200;
		const message = "success";
		const path = request.url;
		const data = response;
		return new Response(JSON.stringify({ path, timeStamp, message, status, data }), { headers: commonHeaders, status: 200 });
	});
}

export function errorMiddleware(app: Elysia): Elysia {
	return app.onError(async ({ code, error, request, set }): Promise<Response> => {
		const status = set.status ?? (error as Error).message ?? 500;
		const message = filterMessage((error as Error).message);
		const timeStamp = new Date().toISOString();
		const path = request.url;
		return new Response(JSON.stringify({ path, timeStamp, message, code, status }), { headers: commonHeaders });
	});
}
