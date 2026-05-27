import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  GET,
  resolveRedirectOrigin,
  resolveRedirectPath,
} from "@/app/auth/callback/route";

const { mockExchangeCodeForSession } = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

const originalEnv = { ...process.env };

describe("auth callback route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.APP_ORIGIN = "https://app.example.com";
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
    delete process.env.ALLOWED_REDIRECT_ORIGINS;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("resolveRedirectPath", () => {
    test("相対パスとクエリ文字列を許可する", () => {
      expect(resolveRedirectPath("/dashboard?tab=tasks")).toBe(
        "/dashboard?tab=tasks",
      );
    });

    test("外部URLと危険な相対URLをデフォルトへ戻す", () => {
      expect(resolveRedirectPath("https://evil.example.com")).toBe(
        "/dashboard",
      );
      expect(resolveRedirectPath("//evil.example.com/path")).toBe("/dashboard");
      expect(resolveRedirectPath("/\\evil.example.com/path")).toBe(
        "/dashboard",
      );
    });

    test("相対パスとクエリ文字列を許可する", () => {
      expect(resolveRedirectPath("/dashboard?tab=tasks")).toBe(
        "/dashboard?tab=tasks",
      );
    });

    test("外部URLと危険な相対URLをデフォルトへ戻す", () => {
      expect(resolveRedirectPath("https://evil.example.com")).toBe(
        "/dashboard",
      );
      expect(resolveRedirectPath("//evil.example.com/path")).toBe("/dashboard");
      expect(resolveRedirectPath("/\\evil.example.com/path")).toBe(
        "/dashboard",
      );
    });

    test("nullや空文字の場合はデフォルトへ戻す", () => {
      expect(resolveRedirectPath(null)).toBe("/dashboard");
      expect(resolveRedirectPath("")).toBe("/dashboard");
    });
  });

  describe("resolveRedirectOrigin", () => {
    test("許可された本番オリジンを使う", () => {
      expect(resolveRedirectOrigin("https://app.example.com")).toBe(
        "https://app.example.com",
      );
    });

    test("許可されていないオリジンは本番オリジンへ戻す", () => {
      expect(resolveRedirectOrigin("https://evil.example.com")).toBe(
        "https://app.example.com",
      );
    });

    test("明示されたプレビューURLを許可する", () => {
      process.env.ALLOWED_REDIRECT_ORIGINS =
        "https://preview-self-maintenance.vercel.app";

      expect(
        resolveRedirectOrigin("https://preview-self-maintenance.vercel.app"),
      ).toBe("https://preview-self-maintenance.vercel.app");
    });

    test("許可オリジン未設定の本番環境では失敗する", () => {
      delete process.env.APP_ORIGIN;

      expect(() => resolveRedirectOrigin("https://evil.example.com")).toThrow(
        "No allowed redirect origins configured.",
      );
    });

    test("許可オリジン未設定でも開発環境のローカルオリジンは許可する", () => {
      delete process.env.APP_ORIGIN;
      vi.stubEnv("NODE_ENV", "development");

      expect(resolveRedirectOrigin("http://localhost:3000")).toBe(
        "http://localhost:3000",
      );
    });
  });

  test("x-forwarded-hostをリダイレクト先に使わない", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new Request("https://app.example.com/auth/callback?code=abc", {
        headers: {
          "x-forwarded-host": "evil.example.com",
        },
      }),
    );

    expect(response.headers.get("location")).toBe(
      "https://app.example.com/dashboard",
    );
  });

  test("nextに外部URLが渡された場合はdashboardへ戻す", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new Request(
        "https://app.example.com/auth/callback?code=abc&next=https%3A%2F%2Fevil.example.com",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://app.example.com/dashboard",
    );
  });
});
