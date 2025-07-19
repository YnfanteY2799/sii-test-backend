import { errorMiddleware, successMiddleware } from "@/middlewares/responses.ts";
import CardManagement from "./Management/index.ts";

import { Elysia } from "elysia";

export const routes = new Elysia({ prefix: "api" }).use(successMiddleware).use(errorMiddleware).use([CardManagement]);
