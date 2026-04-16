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
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs" ON public.maintenance_logs
  FOR DELETE USING (auth.uid() = user_id);
