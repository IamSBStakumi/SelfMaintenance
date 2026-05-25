ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_id_user_id_key UNIQUE (id, user_id);

ALTER TABLE public.maintenance_logs
  DROP CONSTRAINT maintenance_logs_item_id_fkey;

ALTER TABLE public.maintenance_logs
  ADD CONSTRAINT maintenance_logs_item_id_user_id_fkey
  FOREIGN KEY (item_id, user_id)
  REFERENCES public.maintenance_items(id, user_id)
  ON DELETE CASCADE;
