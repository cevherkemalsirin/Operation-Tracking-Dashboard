/**
 * Adds a separate resolved date so dashboards can distinguish tickets that
 * were resolved from tickets that were fully closed.
 */

export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_date DATE;

    UPDATE tickets
    SET resolved_date = COALESCE(resolved_date, last_modified_date, close_date, updated_at::date)
    WHERE status = 'Resolved'
      AND resolved_date IS NULL;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE tickets DROP COLUMN IF EXISTS resolved_date;
  `);
};
