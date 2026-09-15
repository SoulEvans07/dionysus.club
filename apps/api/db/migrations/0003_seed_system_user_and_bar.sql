-- Custom SQL migration file, put your code below! --

-- Well-known system user/bar used as the owner of global (bar-agnostic) tags.
-- Ids must match SYSTEM_USER_ID / SYSTEM_BAR_ID in apps/api/src/database/constants.ts.
INSERT INTO "users" ("id", "kinde_id", "email", "username")
VALUES ('00000000-0000-0000-0000-000000000001', '_system', 'system@dionysus.club', '_system')
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint

INSERT INTO "bars" ("id", "owned_by", "name", "barType", "created_by", "updated_by")
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'System',
  'system',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT ("id") DO NOTHING;
