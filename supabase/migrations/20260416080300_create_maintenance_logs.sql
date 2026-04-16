-- 1. メンテナンスログ（完了履歴）テーブルの作成
CREATE TABLE public.maintenance_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.maintenance_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamp with time zone DEFAULT now() NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Row Level Security (RLS) の有効化
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- 3. ポリシーの作成
CREATE POLICY "Users can view their own logs" ON public.maintenance_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" ON public.maintenance_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs" ON public.maintenance_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs" ON public.maintenance_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 4. パフォーマンス向上・検索最適化のためのインデックス作成
CREATE INDEX idx_maintenance_logs_user_id_completed_at ON public.maintenance_logs (user_id, completed_at DESC);
CREATE INDEX idx_maintenance_logs_item_id ON public.maintenance_logs (item_id);
