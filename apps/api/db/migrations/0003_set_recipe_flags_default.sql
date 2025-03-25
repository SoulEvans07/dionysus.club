ALTER TABLE "recipeItem" ALTER COLUMN "is_optional" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "recipeItem" ALTER COLUMN "is_optional" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recipeItem" ALTER COLUMN "is_garnish" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "recipeItem" ALTER COLUMN "is_garnish" SET NOT NULL;