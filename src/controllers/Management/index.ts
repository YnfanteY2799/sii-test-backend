import CreateSingle from "./methods/CreateSingle.ts";
import DeleteSingle from "./methods/DeleteSingle.ts";
import UpdateSingle from "./methods/UpdateSingle.ts";
import GetAll from "./methods/GetAll.ts";

import { Elysia } from "elysia";

export default new Elysia({ prefix: "Card", normalize: true, detail: { tags: ["Card"] } }).use([
	GetAll,
	CreateSingle,
	DeleteSingle,
	UpdateSingle,
]);
