CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  subscription_status text,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT user_profiles_plan_check
    CHECK (plan IN ('free', 'pro')),
  CONSTRAINT user_profiles_subscription_status_check
    CHECK (
      subscription_status IS NULL OR
      subscription_status IN (
        'trialing',
        'active',
        'past_due',
        'canceled',
        'unpaid',
        'incomplete',
        'incomplete_expired',
        'paused'
      )
    )
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile"
  ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_status
  ON public.user_profiles (plan, subscription_status);

DROP TRIGGER IF EXISTS set_updated_at
  ON public.user_profiles;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_profile
  ON auth.users;

CREATE TRIGGER on_auth_user_created_create_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();

INSERT INTO public.user_profiles (user_id)
SELECT id
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE public.user_profiles
  IS 'アプリユーザーのプラン・課金状態を管理するプロフィールテーブル。';

COMMENT ON COLUMN public.user_profiles.plan
  IS 'free または pro。pro かつ subscription_status が active/trialing の場合に有料扱い。';
