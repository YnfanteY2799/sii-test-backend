CREATE TABLE "cards" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"holder_name" varchar(255) NOT NULL,
	"card_number" varchar(255) NOT NULL,
	"expirement_date" timestamp with time zone NOT NULL,
	"card_cvv" varchar(4) NOT NULL,
	"card_type_id" smallint DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_card_type_id_fk" FOREIGN KEY ("card_type_id") REFERENCES "public"."card_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cards_id_idx" ON "cards" USING btree ("id");