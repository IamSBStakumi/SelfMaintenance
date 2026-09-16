CREATE OR REPLACE FUNCTION public.complete_maintenance_item(
  p_item_id uuid,
  p_completed_at timestamp with time zone DEFAULT now()
)
RETURNS public.maintenance_items
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  completed_item public.maintenance_items;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION '認証が必要です。'
      USING ERRCODE = '28000';
  END IF;

  UPDATE public.maintenance_items
  SET last_completed_at = p_completed_at
  WHERE id = p_item_id
    AND user_id = current_user_id
  RETURNING * INTO completed_item;

  IF NOT FOUND THEN
    RAISE EXCEPTION '対象の定期タスクが見つかりません。'
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.maintenance_logs (item_id, user_id, completed_at)
  VALUES (p_item_id, current_user_id, p_completed_at);

  RETURN completed_item;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_maintenance_item(uuid, timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_maintenance_item(uuid, timestamp with time zone) TO authenticated;

COMMENT ON FUNCTION public.complete_maintenance_item(uuid, timestamp with time zone)
  IS 'ログインユーザー所有のメンテナンス項目について、最終完了日時の更新と完了履歴の作成を同一トランザクションで実行する。';
