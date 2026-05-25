-- 既存ログの item_id と user_id が一致しない場合は、制約変更前に中断する。
-- 不整合が見つかった場合は、以下のクエリで対象行を確認してから修正または削除する。
-- SELECT
--   logs.id,
--   logs.item_id,
--   logs.user_id,
--   items.user_id AS correct_user_id
-- FROM public.maintenance_logs AS logs
-- LEFT JOIN public.maintenance_items AS items ON items.id = logs.item_id
-- WHERE items.id IS NULL
--    OR items.user_id <> logs.user_id;
DO $$
DECLARE
  mismatched_logs_count bigint;
BEGIN
  SELECT count(*)
  INTO mismatched_logs_count
  FROM public.maintenance_logs AS logs
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.maintenance_items AS items
    WHERE items.id = logs.item_id
      AND items.user_id = logs.user_id
  );

  IF mismatched_logs_count > 0 THEN
    RAISE EXCEPTION
      'item_id が user_id に属していない maintenance_logs が % 件あります。複合外部キーを追加する前に、対象行を修正または削除してください。',
      mismatched_logs_count;
  END IF;
END $$;

-- maintenance_logs(item_id, user_id) から複合外部キーを張るために必要。
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'maintenance_items_id_user_id_key'
      AND conrelid = 'public.maintenance_items'::regclass
  ) THEN
    ALTER TABLE public.maintenance_items
      ADD CONSTRAINT maintenance_items_id_user_id_key UNIQUE (id, user_id);
  END IF;
END $$;

-- getMaintenanceItems(): WHERE user_id = ? ORDER BY created_at DESC を支援する。
CREATE INDEX IF NOT EXISTS idx_maintenance_items_user_id_created_at
  ON public.maintenance_items (user_id, created_at DESC);

-- 複合外部キーを支援し、item_id 検索もインデックスで処理できるようにする。
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_item_id_user_id
  ON public.maintenance_logs (item_id, user_id);

-- item_id のみの外部キーを、所有者を含む複合外部キーへ置き換える。
ALTER TABLE public.maintenance_logs
  DROP CONSTRAINT IF EXISTS maintenance_logs_item_id_fkey;

DROP INDEX IF EXISTS public.idx_maintenance_logs_item_id;

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
      ON DELETE CASCADE
      ON UPDATE CASCADE
      NOT VALID;
  END IF;
END $$;

COMMENT ON CONSTRAINT maintenance_items_id_user_id_key ON public.maintenance_items
  IS 'maintenance_logs から所有者を含む外部キーを張るための制約。';

COMMENT ON CONSTRAINT maintenance_logs_item_id_user_id_fkey ON public.maintenance_logs
  IS '各メンテナンスログが同じユーザーのメンテナンス項目のみを参照することを保証する制約。';
