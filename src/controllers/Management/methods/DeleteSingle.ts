import { NotFoundException, UnauthorizedException } from "@/utils/error";
import { db } from "@/db/index.ts";

import { Elysia } from "elysia";

export default new Elysia().delete("DeleteSingle/:id", async () => {}, {});
