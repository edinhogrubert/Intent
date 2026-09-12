ALTER TABLE "intents"
  ADD COLUMN "condition_type" VARCHAR(30) NOT NULL DEFAULT 'SUPPORT',
  ADD COLUMN "reveal_at" TIMESTAMPTZ(3),
  ADD COLUMN "guardian_ids" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "guardian_approvals" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "guardian_approval_goal" INTEGER;

UPDATE "intents"
SET "condition_type" = 'SUPPORT'
WHERE "condition_type" IS NULL;

CREATE INDEX "intents_condition_type_reveal_at_idx" ON "intents"("condition_type", "reveal_at");
