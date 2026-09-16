-- タスク削除後も完了履歴を保持し、当時のタスク情報を表示できるようにする。
ALTER TABLE public.maintenance_logs
  ADD COLUMN IF NOT EXISTS maintenance_item_name text,
  ADD COLUMN IF NOT EXISTS maintenance_item_icon text;

UPDATE public.maintenance_logs AS logs
SET
  maintenance_item_name = COALESCE(logs.maintenance_item_name, items.name),
  maintenance_item_icon = COALESCE(logs.maintenance_item_icon, items.icon)
FROM public.maintenance_items AS items
WHERE logs.item_id = items.id
  AND logs.user_id = items.user_id
  AND (
    logs.maintenance_item_name IS NULL
    OR logs.maintenance_item_icon IS NULL
  );

CREATE OR REPLACE FUNCTION public.set_maintenance_log_item_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  target_item record;
BEGIN
  IF NEW.item_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT name, icon
  INTO target_item
  FROM public.maintenance_items
  WHERE id = NEW.item_id
    AND user_id = NEW.user_id;

  IF FOUND THEN
    NEW.maintenance_item_name = target_item.name;
    NEW.maintenance_item_icon = target_item.icon;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_maintenance_log_item_snapshot ON public.maintenance_logs;

CREATE TRIGGER set_maintenance_log_item_snapshot
BEFORE INSERT OR UPDATE OF item_id, user_id ON public.maintenance_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_maintenance_log_item_snapshot();

ALTER TABLE public.maintenance_logs
  DROP CONSTRAINT IF EXISTS maintenance_logs_item_id_user_id_fkey;

ALTER TABLE public.maintenance_logs
  ALTER COLUMN item_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'maintenance_logs_item_id_user_id_fkey'
      AND conrelid = 'public.maintenance_logs'::regclass
  ) THEN
    ALTER TABLE public.maintenance_logs
      ADD CONSTRAINT maintenance_logs_item_id_user_id_fkey
      FOREIGN KEY (item_id, user_id)
      REFERENCES public.maintenance_items(id, user_id)
      ON DELETE SET NULL (item_id)
      ON UPDATE CASCADE
      NOT VALID;
  END IF;
END $$;

COMMENT ON COLUMN public.maintenance_logs.maintenance_item_name
  IS '完了時点の定期タスク名。タスク削除後の履歴表示に使用する。';

COMMENT ON COLUMN public.maintenance_logs.maintenance_item_icon
  IS '完了時点の定期タスクアイコン。タスク削除後の履歴表示に使用する。';

COMMENT ON CONSTRAINT maintenance_logs_item_id_user_id_fkey ON public.maintenance_logs
  IS 'ログの参照先タスクが削除されても、ログ所有者を残したまま item_id のみ NULL にして履歴を保持する。';
