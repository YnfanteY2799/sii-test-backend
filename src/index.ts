import { jwtExpiresIn, jwtSecret, maxRequestBodySize, serverPort } from "@/utils/consts/env.ts";
import { type ElysiaSwaggerConfig, swagger } from "@elysiajs/swagger";
import { routes } from "@/controllers/index.ts";
import { helmet } from "elysia-helmet";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

const helmetExec = helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false });

const swaggerConfig: ElysiaSwaggerConfig<"/Documentation"> = {
	exclude: ["/swagger", "/swagger/json", "/json"],
	scalarConfig: { searchHotKey: "k" },
	path: "/Documentation",
	version: "0.1",
	theme: "dark",
};

new Elysia({ name: "Cardholder API", strictPath: true, serve: { maxRequestBodySize, id: "Cardholder API" } })
	.use(jwt({ name: "jwt", secret: jwtSecret, exp: jwtExpiresIn }))
	.get("ping", () => "pong", { tags: ["Test"] })
	.use(swagger(swaggerConfig))
	.use(helmetExec)
	.use(cors())
	.use(routes)
	.listen(serverPort ?? 8080, ({ url }) => console.log(`🦊 Elisya, App => ( Cardholder-App ) is Running on 📚 ${url}Documentation`));
