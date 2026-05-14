/**
 * Ticket comment mentions.
 *
 * A work note can mention one or more users. Mentions are stored separately
 * from the note text so the Welcome page can reliably show notifications for
 * the tagged user without trying to parse "@name" strings later.
 */

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS ticket_comment_mentions (
      id SERIAL PRIMARY KEY,
      comment_id INTEGER NOT NULL REFERENCES ticket_comments(id) ON DELETE CASCADE,
      mentioned_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      read_at TIMESTAMPTZ,
      UNIQUE (comment_id, mentioned_user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_ticket_comment_mentions_user
      ON ticket_comment_mentions(mentioned_user_id, created_at DESC);
  `);
};

export const down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS ticket_comment_mentions;');
};
