import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import formatNextDue from "@/utils/formatNextDue";

describe("formatNextDue", () => {
  // タイムゾーンによる日付のブレを防ぐため、基準となる時間を固定します
  beforeEach(() => {
    vi.useFakeTimers();
    // 2024年4月1日 12:00:00 (JSTを想定) を基準時間に設定
    vi.setSystemTime(new Date(2024, 3, 1, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('無効な日付が渡された場合は "-" を返すこと', () => {
    const invalidDate = new Date("invalid date");
    expect(formatNextDue(invalidDate)).toBe("-");
  });

  test('今日の日付が渡された場合は "今日" を返すこと', () => {
    // 基準日時と同じ日 (2024年4月1日) を渡す
    const date = new Date(2024, 3, 1, 15, 0, 0);
    expect(formatNextDue(date)).toBe("今日");
  });

  test('明日の日付が渡された場合は "明日" を返すこと', () => {
    // 基準日時の翌日 (2024年4月2日) を渡す
    const date = new Date(2024, 3, 2, 10, 0, 0);
    expect(formatNextDue(date)).toBe("明日");
  });

  test('それ以外の日付（未来）が渡された場合は "yyyy-MM-dd" 形式で返すこと', () => {
    // 基準日時の数日後 (2024年4月5日) を渡す
    const date = new Date(2024, 3, 5, 0, 0, 0);
    expect(formatNextDue(date)).toBe("2024-04-05");
  });

  test('それ以外の日付（過去）が渡された場合は "yyyy-MM-dd" 形式で返すこと', () => {
    // 基準日時の数日前 (2024年3月30日) を渡す
    const date = new Date(2024, 2, 30, 0, 0, 0);
    expect(formatNextDue(date)).toBe("2024-03-30");
  });
});
