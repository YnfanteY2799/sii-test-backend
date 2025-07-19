import { NotFoundException, UnauthorizedException } from "@/utils/error";
import { CreateSingleCardDTO } from "../dto/index.ts";
import { db } from "@/db/index.ts";

import { Elysia } from "elysia";

export default new Elysia().post("Create", async ({ body }) => {}, { body: CreateSingleCardDTO });
