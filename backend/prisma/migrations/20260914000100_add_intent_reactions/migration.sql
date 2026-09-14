-- CreateEnum
CREATE TYPE "IntentReactionType" AS ENUM ('LIKE', 'LOVE', 'CELEBRATE');

-- CreateTable
CREATE TABLE "intent_reactions" (
  "id" UUID NOT NULL,
  "intent_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "IntentReactionType" NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "intent_reactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "intent_reactions_intent_id_fkey" FOREIGN KEY ("intent_id")
    REFERENCES "intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "intent_reactions_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "intent_reactions_intent_id_user_id_key" ON "intent_reactions"("intent_id", "user_id");
CREATE INDEX "intent_reactions_intent_id_type_idx" ON "intent_reactions"("intent_id", "type");
CREATE INDEX "intent_reactions_user_id_created_at_idx" ON "intent_reactions"("user_id", "created_at" DESC);
