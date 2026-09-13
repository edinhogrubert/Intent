CREATE TYPE "NotificationType" AS ENUM (
  'FOLLOW_RECEIVED',
  'SUPPORT_RECEIVED',
  'GUARDIAN_APPROVAL_RECEIVED'
);

CREATE TABLE "notifications" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "NotificationType" NOT NULL,
  "actor_id" UUID NOT NULL,
  "intent_id" UUID,
  "deduplication_key" VARCHAR(180) NOT NULL,
  "read_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "notifications_intent_id_fkey" FOREIGN KEY ("intent_id")
    REFERENCES "intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "notifications_deduplication_key_key"
  ON "notifications"("deduplication_key");
CREATE INDEX "notifications_user_id_created_at_idx"
  ON "notifications"("user_id", "created_at" DESC);
