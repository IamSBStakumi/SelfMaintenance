import { describe, test, expect } from "vitest";
import getCardColor from "@/utils/getCardColor";

describe("getCardColor", () => {
  test("14日以内ならsoft-pinkを返すこと", () => {
    expect(getCardColor(1)).toBe("bg-soft-pink");
  });

  test("15日〜90日以内ならmintを返すこと", () => {
    expect(getCardColor(35)).toBe("bg-mint");
  });

  test("91日以上ならlavenderを返すこと", () => {
    expect(getCardColor(100)).toBe("bg-lavender");
  });

  test("境界値: 14日ならsoft-pinkを返すこと", () => {
    expect(getCardColor(14)).toBe("bg-soft-pink");
  });

  test("境界値: 15日ならmintを返すこと", () => {
    expect(getCardColor(15)).toBe("bg-mint");
  });

  test("境界値: 90日ならmintを返すこと", () => {
    expect(getCardColor(90)).toBe("bg-mint");
  });

  test("境界値: 91日ならlavenderを返すこと", () => {
    expect(getCardColor(91)).toBe("bg-lavender");
  });

  test("0が渡された場合はsoft-pinkを返すこと", () => {
    expect(getCardColor(0)).toBe("bg-soft-pink");
  });

  test("負の値が渡された場合はsoft-pinkを返すこと", () => {
    expect(getCardColor(-1)).toBe("bg-soft-pink");
  });
});
