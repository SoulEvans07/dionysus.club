CREATE TYPE "public"."bar_role" AS ENUM('admin', 'bartender', 'member', 'guest');--> statement-breakpoint
CREATE TYPE "public"."bar_type" AS ENUM('public', 'private', 'personal');--> statement-breakpoint
CREATE TYPE "public"."share_link_type" AS ENUM('copy');--> statement-breakpoint
CREATE TABLE "bar_users" (
	"bar_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "bar_role" NOT NULL,
	CONSTRAINT "bar_users_bar_id_user_id_pk" PRIMARY KEY("bar_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "bars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"deleted_by" uuid,
	"owned_by" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"slogan" varchar(512) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"logo_image_id" uuid,
	"banner_image_id" uuid,
	"barType" "bar_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cocktails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"deleted_by" uuid,
	"bar_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"icon_image_id" uuid,
	"card_image_id" uuid
);
--> statement-breakpoint
CREATE TABLE "recipeItem" (
	"cocktail_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"index" integer DEFAULT 0 NOT NULL,
	"unit" varchar(32) NOT NULL,
	"quantity" real NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"is_garnish" boolean DEFAULT false NOT NULL,
	CONSTRAINT "recipeItem_cocktail_id_ingredient_id_pk" PRIMARY KEY("cocktail_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_steps" (
	"cocktail_id" uuid NOT NULL,
	"index" integer DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_id" uuid,
	CONSTRAINT "recipe_steps_cocktail_id_index_pk" PRIMARY KEY("cocktail_id","index")
);
--> statement-breakpoint
CREATE TABLE "image_blobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"deleted_by" uuid,
	"filename" varchar(64) NOT NULL,
	"url" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"kinde_id" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"username" varchar(256) NOT NULL,
	"profile_image_id" uuid,
	CONSTRAINT "users_kinde_id_unique" UNIQUE("kinde_id")
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"deleted_by" uuid,
	"bar_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"available" boolean DEFAULT false NOT NULL,
	"units" text DEFAULT '[]' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"icon_image_id" uuid,
	"card_image_id" uuid
);
--> statement-breakpoint
CREATE TABLE "menu_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_id" uuid NOT NULL,
	"index" integer DEFAULT 0 NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"filter" text DEFAULT '' NOT NULL,
	"default_sort_by" varchar(32) DEFAULT 'name' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"menu_id" uuid NOT NULL,
	"cocktail_id" uuid NOT NULL,
	"menu_group_id" uuid,
	"index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "menu_items_menu_id_cocktail_id_pk" PRIMARY KEY("menu_id","cocktail_id")
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"deleted_by" uuid,
	"bar_id" uuid NOT NULL,
	"title" varchar(256) NOT NULL,
	"subtitle" varchar(512) DEFAULT '' NOT NULL,
	"filter" text DEFAULT '' NOT NULL,
	"default_sort_by" varchar(32) DEFAULT 'name' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_link_cocktails" (
	"share_link_id" uuid NOT NULL,
	"cocktail_id" uuid NOT NULL,
	CONSTRAINT "share_link_cocktails_share_link_id_cocktail_id_pk" PRIMARY KEY("share_link_id","cocktail_id")
);
--> statement-breakpoint
CREATE TABLE "share_link_ingredients" (
	"share_link_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	CONSTRAINT "share_link_ingredients_share_link_id_ingredient_id_pk" PRIMARY KEY("share_link_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"type" "share_link_type" DEFAULT 'copy' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bar_users" ADD CONSTRAINT "bar_users_bar_id_bars_id_fk" FOREIGN KEY ("bar_id") REFERENCES "public"."bars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bar_users" ADD CONSTRAINT "bar_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bars" ADD CONSTRAINT "bars_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bars" ADD CONSTRAINT "bars_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bars" ADD CONSTRAINT "bars_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bars" ADD CONSTRAINT "bars_owned_by_users_id_fk" FOREIGN KEY ("owned_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bars" ADD CONSTRAINT "bars_logo_image_id_image_blobs_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."image_blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bars" ADD CONSTRAINT "bars_banner_image_id_image_blobs_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."image_blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cocktails" ADD CONSTRAINT "cocktails_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cocktails" ADD CONSTRAINT "cocktails_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cocktails" ADD CONSTRAINT "cocktails_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cocktails" ADD CONSTRAINT "cocktails_bar_id_bars_id_fk" FOREIGN KEY ("bar_id") REFERENCES "public"."bars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cocktails" ADD CONSTRAINT "cocktails_icon_image_id_image_blobs_id_fk" FOREIGN KEY ("icon_image_id") REFERENCES "public"."image_blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cocktails" ADD CONSTRAINT "cocktails_card_image_id_image_blobs_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."image_blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipeItem" ADD CONSTRAINT "recipeItem_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipeItem" ADD CONSTRAINT "recipeItem_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_image_id_image_blobs_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image_blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_blobs" ADD CONSTRAINT "image_blobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_blobs" ADD CONSTRAINT "image_blobs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_blobs" ADD CONSTRAINT "image_blobs_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_profile_image_id_image_blobs_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."image_blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_bar_id_bars_id_fk" FOREIGN KEY ("bar_id") REFERENCES "public"."bars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_icon_image_id_image_blobs_id_fk" FOREIGN KEY ("icon_image_id") REFERENCES "public"."image_blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_card_image_id_image_blobs_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."image_blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_groups" ADD CONSTRAINT "menu_groups_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_group_id_menu_groups_id_fk" FOREIGN KEY ("menu_group_id") REFERENCES "public"."menu_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_bar_id_bars_id_fk" FOREIGN KEY ("bar_id") REFERENCES "public"."bars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link_cocktails" ADD CONSTRAINT "share_link_cocktails_share_link_id_share_links_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."share_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link_cocktails" ADD CONSTRAINT "share_link_cocktails_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link_ingredients" ADD CONSTRAINT "share_link_ingredients_share_link_id_share_links_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."share_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link_ingredients" ADD CONSTRAINT "share_link_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;