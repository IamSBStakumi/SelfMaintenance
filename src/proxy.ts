import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/proxy";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/mypage",
  "/calendar",
  "/create_task",
  "/task",
];

/**
 * Next.js v16 Proxy
 * リクエスト実行前に認証状態をチェックし、必要に応じてリダイレクトを行います。
 */
export async function proxy(request: NextRequest) {
  const { supabase, res } = createClient(request);

  // 現在のユーザー情報を取得
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // 取得失敗時は安全側に倒し、user を null として扱う（保護ルートへのアクセスをブロック）
    console.error("getUser failed: ", error);
  }

  const { pathname } = request.nextUrl;

  // 保護されたルートの判定
  const matchesRoute = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`);
  const isProtectedRoute = PROTECTED_ROUTES.some(matchesRoute);

  // 認証関連ページの判定
  const isAuthRoute = matchesRoute("/login");

  // 未ログインで保護されたページにアクセスした場合、ログイン画面へリダイレクト
  if (!user && isProtectedRoute) {
    const redirectResponse = NextResponse.redirect(
      new URL("/login", request.url),
    );
    res.response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // ログイン済みでログイン画面、またはトップ（スプラッシュ）にアクセスした場合、ダッシュボードへリダイレクト
  if (user && (isAuthRoute || pathname === "/")) {
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
    res.response.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));

    return redirectResponse;
  }

  return res.response;
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
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|json|woff2?|ttf|eot)$).*)",
  ],
};
