-- Add deterministic attendance ordering for run queue defaults
ALTER TABLE attendance_players
ADD COLUMN IF NOT EXISTS queue_position INT;

-- Backfill legacy rows using insertion chronology when available.
-- Falls back to stable player_id ordering if created_at does not exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'attendance_players' AND column_name = 'created_at'
  ) THEN
    EXECUTE $q$
      WITH ranked AS (
        SELECT
          session_id,
          player_id,
          ROW_NUMBER() OVER (
            PARTITION BY session_id
            ORDER BY created_at NULLS LAST, player_id
          ) AS pos
        FROM attendance_players
      )
      UPDATE attendance_players ap
      SET queue_position = ranked.pos
      FROM ranked
      WHERE ap.session_id = ranked.session_id
        AND ap.player_id = ranked.player_id
        AND ap.queue_position IS NULL
    $q$;
  ELSE
    EXECUTE $q$
      WITH ranked AS (
        SELECT
          session_id,
          player_id,
          ROW_NUMBER() OVER (
            PARTITION BY session_id
            ORDER BY player_id
          ) AS pos
        FROM attendance_players
      )
      UPDATE attendance_players ap
      SET queue_position = ranked.pos
      FROM ranked
      WHERE ap.session_id = ranked.session_id
        AND ap.player_id = ranked.player_id
        AND ap.queue_position IS NULL
    $q$;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS attendance_players_session_queue_idx
  ON attendance_players(session_id, queue_position);

CREATE UNIQUE INDEX IF NOT EXISTS attendance_players_session_player_uidx
  ON attendance_players(session_id, player_id);
