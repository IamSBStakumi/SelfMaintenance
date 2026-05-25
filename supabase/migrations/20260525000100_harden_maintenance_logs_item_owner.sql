ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_id_user_id_key UNIQUE (id, user_id);

CREATE INDEX idx_maintenance_items_user_id_created_at
  ON public.maintenance_items (user_id, created_at DESC);

ALTER TABLE public.maintenance_logs
  DROP CONSTRAINT maintenance_logs_item_id_fkey;

DROP INDEX IF EXISTS public.idx_maintenance_logs_item_id;

CREATE INDEX idx_maintenance_logs_item_id_user_id
  ON public.maintenance_logs (item_id, user_id);

ALTER TABLE public.maintenance_logs
  ADD CONSTRAINT maintenance_logs_item_id_user_id_fkey
  FOREIGN KEY (item_id, user_id)
  REFERENCES public.maintenance_items(id, user_id)
  ON DELETE CASCADE;
