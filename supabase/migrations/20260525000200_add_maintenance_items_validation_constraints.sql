DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'maintenance_items_name_length_check'
      AND conrelid = 'public.maintenance_items'::regclass
  ) THEN
    ALTER TABLE public.maintenance_items
      ADD CONSTRAINT maintenance_items_name_length_check
      CHECK (char_length(btrim(name)) BETWEEN 1 AND 100)
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'maintenance_items_icon_length_check'
      AND conrelid = 'public.maintenance_items'::regclass
  ) THEN
    ALTER TABLE public.maintenance_items
      ADD CONSTRAINT maintenance_items_icon_length_check
      CHECK (icon IS NULL OR char_length(btrim(icon)) <= 2)
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'maintenance_items_interval_days_range_check'
      AND conrelid = 'public.maintenance_items'::regclass
  ) THEN
    ALTER TABLE public.maintenance_items
      ADD CONSTRAINT maintenance_items_interval_days_range_check
      CHECK (interval_days BETWEEN 1 AND 36500)
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'maintenance_items_memo_length_check'
      AND conrelid = 'public.maintenance_items'::regclass
  ) THEN
    ALTER TABLE public.maintenance_items
      ADD CONSTRAINT maintenance_items_memo_length_check
      CHECK (memo IS NULL OR char_length(memo) <= 1000)
      NOT VALID;
  END IF;
END $$;
