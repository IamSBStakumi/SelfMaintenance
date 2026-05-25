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
      'Found % maintenance_logs rows with mismatched user_id and item owner. The new foreign key is added as NOT VALID and will protect future writes. Review existing rows before validating the constraint.',
      mismatched_logs_count;
  END IF;
END $$;

ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_id_user_id_key UNIQUE (id, user_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_items_user_id_created_at
  ON public.maintenance_items (user_id, created_at DESC);

ALTER TABLE public.maintenance_logs
  DROP CONSTRAINT maintenance_logs_item_id_fkey;

DROP INDEX IF EXISTS public.idx_maintenance_logs_item_id;

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_item_id_user_id
  ON public.maintenance_logs (item_id, user_id);

ALTER TABLE public.maintenance_logs
  ADD CONSTRAINT maintenance_logs_item_id_user_id_fkey
  FOREIGN KEY (item_id, user_id)
  REFERENCES public.maintenance_items(id, user_id)
  ON DELETE CASCADE
  NOT VALID;
