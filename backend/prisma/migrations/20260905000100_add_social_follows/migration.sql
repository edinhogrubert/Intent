CREATE TABLE "follows" (
    "id" UUID NOT NULL,
    "follower_id" UUID NOT NULL,
    "following_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "follows_no_self_follow" CHECK ("follower_id" <> "following_id")
);

CREATE UNIQUE INDEX "follows_follower_id_following_id_key"
    ON "follows"("follower_id", "following_id");

CREATE INDEX "follows_following_id_created_at_idx"
    ON "follows"("following_id", "created_at" DESC);

CREATE INDEX "follows_follower_id_created_at_idx"
    ON "follows"("follower_id", "created_at" DESC);

ALTER TABLE "follows"
    ADD CONSTRAINT "follows_follower_id_fkey"
    FOREIGN KEY ("follower_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "follows"
    ADD CONSTRAINT "follows_following_id_fkey"
    FOREIGN KEY ("following_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
