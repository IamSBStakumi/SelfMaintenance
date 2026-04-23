import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MyPageContent from "./MyPageContent";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログインの場合はログイン画面へリダイレクト（サーバーサイドで実行）
  if (!user) {
    redirect("/login");
  }

  return <MyPageContent initialUser={user} />;
}
