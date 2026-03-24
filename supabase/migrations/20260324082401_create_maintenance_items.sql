-- 1. メンテナンス項目テーブルの作成
CREATE TABLE public.maintenance_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- NOT KEY を NOT NULL に修正し、外部キー制約を標準的な形に
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
  name text NOT NULL,                                              
  icon text,                                                       
  interval_days integer NOT NULL,                                  
  last_completed_at timestamp with time zone DEFAULT now() NOT NULL, 
  memo text,                                                       
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Row Level Security (RLS) の有効化
ALTER TABLE public.maintenance_items ENABLE ROW LEVEL SECURITY;

-- 3. ポリシーの作成
CREATE POLICY "Users can view their own items" ON public.maintenance_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON public.maintenance_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON public.maintenance_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON public.maintenance_items
  FOR DELETE USING (auth.uid() = user_id);

-- 4. updated_at を自動更新する関数の設定
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.maintenance_items
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();