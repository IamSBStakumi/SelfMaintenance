DO $$
DECLARE
  mismatched_logs_count bigint;
BEGIN
  SELECT count(*)
  INTO mismatched_logs_count
  FROM public.maintenance_logs AS logs
  JOIN public.maintenance_items AS items ON items.id = logs.item_id
  WHERE logs.user_id <> items.user_id;

  IF mismatched_logs_count > 0 THEN
    RAISE WARNING
      'Found % maintenance_logs rows with mismatched user_id and item owner. The new trigger will protect future writes. Review existing rows manually.',
      mismatched_logs_count;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_maintenance_items_user_id_created_at
  ON public.maintenance_items (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.ensure_maintenance_log_item_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.maintenance_items AS items
    WHERE items.id = NEW.item_id
      AND items.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'maintenance_logs.item_id must belong to maintenance_logs.user_id'
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_maintenance_log_item_owner ON public.maintenance_logs;

CREATE TRIGGER enforce_maintenance_log_item_owner
BEFORE INSERT OR UPDATE OF item_id, user_id ON public.maintenance_logs
FOR EACH ROW
EXECUTE FUNCTION public.ensure_maintenance_log_item_owner();
