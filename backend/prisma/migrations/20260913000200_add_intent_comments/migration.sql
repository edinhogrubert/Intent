CREATE TABLE "intent_comments" (
  "id" UUID NOT NULL,
  "intent_id" UUID NOT NULL,
  "author_id" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "intent_comments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "intent_comments_intent_id_fkey" FOREIGN KEY ("intent_id")
    REFERENCES "intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "intent_comments_author_id_fkey" FOREIGN KEY ("author_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "intent_comments_intent_id_created_at_idx"
  ON "intent_comments"("intent_id", "created_at");
CREATE INDEX "intent_comments_author_id_created_at_idx"
  ON "intent_comments"("author_id", "created_at");
