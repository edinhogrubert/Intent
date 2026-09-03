CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firebase_uid" VARCHAR(128) NOT NULL,
    "email" VARCHAR(320),
    "username" VARCHAR(40) NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "bio" VARCHAR(500),
    "avatar_url" VARCHAR(2048),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_status_check" CHECK ("status" IN ('ACTIVE', 'SUSPENDED', 'DELETED'))
);

CREATE TABLE "intents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL DEFAULT 'SUPPORT_REVEAL',
    "status" VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    "title" VARCHAR(160) NOT NULL,
    "story" TEXT NOT NULL,
    "support_goal" INTEGER NOT NULL,
    "support_count" INTEGER NOT NULL DEFAULT 0,
    "reveal_ciphertext" TEXT NOT NULL,
    "reveal_iv" VARCHAR(64) NOT NULL,
    "reveal_auth_tag" VARCHAR(64) NOT NULL,
    "reveal_version" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "realized_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "intents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "intents_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "intents_type_check" CHECK ("type" = 'SUPPORT_REVEAL'),
    CONSTRAINT "intents_status_check" CHECK ("status" IN ('PUBLISHED', 'REALIZED', 'CANCELLED')),
    CONSTRAINT "intents_visibility_check" CHECK ("visibility" IN ('PUBLIC', 'FOLLOWERS', 'PRIVATE')),
    CONSTRAINT "intents_support_goal_check" CHECK ("support_goal" >= 1 AND "support_goal" <= 1000000),
    CONSTRAINT "intents_support_count_check" CHECK ("support_count" >= 0)
);

CREATE TABLE "supports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "intent_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supports_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supports_intent_id_fkey" FOREIGN KEY ("intent_id") REFERENCES "intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "supports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "domain_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "intent_id" UUID,
    "actor_id" UUID,
    "type" VARCHAR(80) NOT NULL,
    "payload" JSONB NOT NULL,
    "idempotency_key" VARCHAR(180) NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "domain_events_intent_id_fkey" FOREIGN KEY ("intent_id") REFERENCES "intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "domain_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE INDEX "intents_status_visibility_created_at_idx" ON "intents"("status", "visibility", "created_at" DESC);
CREATE INDEX "intents_creator_id_created_at_idx" ON "intents"("creator_id", "created_at" DESC);
CREATE UNIQUE INDEX "supports_intent_id_user_id_key" ON "supports"("intent_id", "user_id");
CREATE INDEX "supports_user_id_created_at_idx" ON "supports"("user_id", "created_at" DESC);
CREATE UNIQUE INDEX "domain_events_idempotency_key_key" ON "domain_events"("idempotency_key");
CREATE INDEX "domain_events_intent_id_occurred_at_idx" ON "domain_events"("intent_id", "occurred_at");
CREATE INDEX "domain_events_actor_id_occurred_at_idx" ON "domain_events"("actor_id", "occurred_at");

CREATE OR REPLACE FUNCTION prevent_domain_event_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'domain_events is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER domain_events_no_update
BEFORE UPDATE ON "domain_events"
FOR EACH ROW EXECUTE FUNCTION prevent_domain_event_mutation();

CREATE TRIGGER domain_events_no_delete
BEFORE DELETE ON "domain_events"
FOR EACH ROW EXECUTE FUNCTION prevent_domain_event_mutation();
