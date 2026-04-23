import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/proxy";

/**
 * Next.js v16 Proxy
 * リクエスト実行前に認証状態をチェックし、必要に応じてリダイレクトを行います。
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // 現在のユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 保護されたルートの判定
  const protectedRoutes = [
    "/dashboard",
    "/mypage",
    "/calendar",
    "/create_task",
    "/task",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 認証関連ページの判定
  const isAuthRoute = pathname.startsWith("/login");

  // 未ログインで保護されたページにアクセスした場合、ログイン画面へリダイレクト
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みでログイン画面、またはトップ（スプラッシュ）にアクセスした場合、ダッシュボードへリダイレクト
  if (user && (isAuthRoute || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 次のパス以外のすべてのリクエストパスにマッチさせます：
     * - api (APIルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - images (パブリック画像)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
