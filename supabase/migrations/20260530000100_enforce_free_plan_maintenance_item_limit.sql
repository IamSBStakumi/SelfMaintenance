CREATE OR REPLACE FUNCTION public.enforce_free_plan_maintenance_item_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_item_count integer;
  free_plan_item_limit constant integer := 3;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));

  SELECT count(*)
  INTO current_item_count
  FROM public.maintenance_items
  WHERE user_id = NEW.user_id;

  IF current_item_count >= free_plan_item_limit THEN
    RAISE EXCEPTION '無料版で登録できるタスクは3件までです。今後、上限を増やせるプランを提供予定です。'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_free_plan_maintenance_item_limit
  ON public.maintenance_items;

CREATE TRIGGER enforce_free_plan_maintenance_item_limit
BEFORE INSERT ON public.maintenance_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_free_plan_maintenance_item_limit();

COMMENT ON FUNCTION public.enforce_free_plan_maintenance_item_limit()
  IS '無料版ユーザーの定期タスク登録数を3件までに制限する。';
