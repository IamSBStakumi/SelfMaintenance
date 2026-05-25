DROP POLICY IF EXISTS "Users can view their own logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Users can delete their own logs" ON public.maintenance_logs;

CREATE POLICY "Users can view their own logs" ON public.maintenance_logs
  FOR SELECT USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.maintenance_items
      WHERE maintenance_items.id = maintenance_logs.item_id
        AND maintenance_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own logs" ON public.maintenance_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.maintenance_items
      WHERE maintenance_items.id = maintenance_logs.item_id
        AND maintenance_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own logs" ON public.maintenance_logs
  FOR UPDATE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.maintenance_items
      WHERE maintenance_items.id = maintenance_logs.item_id
        AND maintenance_items.user_id = auth.uid()
    )
  ) WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.maintenance_items
      WHERE maintenance_items.id = maintenance_logs.item_id
        AND maintenance_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own logs" ON public.maintenance_logs
  FOR DELETE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.maintenance_items
      WHERE maintenance_items.id = maintenance_logs.item_id
        AND maintenance_items.user_id = auth.uid()
    )
  );
