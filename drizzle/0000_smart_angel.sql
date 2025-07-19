CREATE TABLE "card_type" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "card_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX "card_type_id_idx" ON "card_type" USING btree ("id");