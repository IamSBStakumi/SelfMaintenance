-- 1. テストユーザーの作成（auth.users にデータを挿入）
-- すでに存在する場合のエラーを避けるため、ON CONFLICTを利用するか、一度削除してから作成します。
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'test@example.com', 
  '{"name": "Test User"}', 
  now(), 
  now(), 
  'authenticated', 
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- 2. メンテナンス項目の挿入
-- ユーザーIDを上記で作成したものに合わせます
DO $$
DECLARE
    target_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN

-- 既存データのクリーンアップ（念のため）
DELETE FROM public.maintenance_items WHERE user_id = target_user_id;

-- 美容室（30日周期）: 25日経過（そろそろ限界）
INSERT INTO public.maintenance_items (user_id, name, icon, interval_days, last_completed_at, memo)
VALUES (target_user_id, '美容室', '💇‍♀️', 30, now() - interval '25 days', '次はショートにしたい');

-- 歯医者（90日周期）: 10日経過（ピカピカ）
INSERT INTO public.maintenance_items (user_id, name, icon, interval_days, last_completed_at, memo)
VALUES (target_user_id, '歯医者', '🦷', 90, now() - interval '10 days', '定期検診');

-- シーツ洗濯（14日周期）: 20日経過（6日オーバーの限界突破）
INSERT INTO public.maintenance_items (user_id, name, icon, interval_days, last_completed_at, memo)
VALUES (target_user_id, 'シーツ洗濯', '🧺', 14, now() - interval '20 days', '柔軟剤変える');

-- コンタクト注文（90日周期）: 45日経過（半分）
INSERT INTO public.maintenance_items (user_id, name, icon, interval_days, last_completed_at, memo)
VALUES (target_user_id, 'コンタクト注文', '👁️', 90, now() - interval '45 days', '右:-3.5 左:-3.25');

END $$;