CREATE TABLE "cocktails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"owner_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "recipeItem" (
	"cocktail_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"amount" real NOT NULL,
	"is_optional" boolean,
	"is_garnish" boolean,
	CONSTRAINT "recipeItem_cocktail_id_ingredient_id_pk" PRIMARY KEY("cocktail_id","ingredient_id")
);
--> statement-breakpoint
ALTER TABLE "cocktails" ADD CONSTRAINT "cocktails_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipeItem" ADD CONSTRAINT "recipeItem_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipeItem" ADD CONSTRAINT "recipeItem_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;