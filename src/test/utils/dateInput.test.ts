import { describe, expect, test } from "vitest";
import {
  dateInputValueToTimestamp,
  dateToDateInputValue,
  timestampToDateInputValue,
} from "@/utils/dateInput";

describe("dateInput", () => {
  test("DateをHTML date input用のローカル日付に変換すること", () => {
    expect(dateToDateInputValue(new Date(2026, 4, 1, 23, 30))).toBe(
      "2026-05-01",
    );
  });

  test("HTML date inputの値をローカル正午のtimestampに変換すること", () => {
    expect(dateInputValueToTimestamp("2026-05-01")).toBe(
      new Date(2026, 4, 1, 12, 0, 0, 0).toISOString(),
    );
  });

  test("保存用timestampからHTML date input用のローカル日付へ戻せること", () => {
    const timestamp = dateInputValueToTimestamp("2026-05-01");

    expect(timestampToDateInputValue(timestamp)).toBe("2026-05-01");
  });

  test("HTML date inputの値を保存用timestampにしても同じ日付へ戻せること", () => {
    const dateInputValue = "2026-05-01";

    expect(
      timestampToDateInputValue(dateInputValueToTimestamp(dateInputValue)),
    ).toBe(dateInputValue);
  });
});
