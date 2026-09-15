CREATE TYPE "public"."tag_type" AS ENUM('cocktail', 'ingredient', 'both');--> statement-breakpoint
ALTER TYPE "public"."bar_type" ADD VALUE 'system';--> statement-breakpoint
CREATE TABLE "cocktail_tags" (
	"cocktail_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "cocktail_tags_cocktail_id_tag_id_pk" PRIMARY KEY("cocktail_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "ingredient_tags" (
	"ingredient_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "ingredient_tags_ingredient_id_tag_id_pk" PRIMARY KEY("ingredient_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"deleted_by" uuid,
	"bar_id" uuid NOT NULL,
	"type" "tag_type" NOT NULL,
	"namespace" varchar(64) NOT NULL,
	"key" varchar(64) NOT NULL,
	"name" varchar(256) NOT NULL,
	"color" varchar(32) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cocktail_tags" ADD CONSTRAINT "cocktail_tags_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cocktail_tags" ADD CONSTRAINT "cocktail_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_tags" ADD CONSTRAINT "ingredient_tags_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_tags" ADD CONSTRAINT "ingredient_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_bar_id_bars_id_fk" FOREIGN KEY ("bar_id") REFERENCES "public"."bars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tags_bar_type_namespace_key_unique" ON "tags" USING btree ("bar_id","type","namespace","key") WHERE "tags"."deleted_at" is null;--> statement-breakpoint
ALTER TABLE "cocktails" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "ingredients" DROP COLUMN "tags";