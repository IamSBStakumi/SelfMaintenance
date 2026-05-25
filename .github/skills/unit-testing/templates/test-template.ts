import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";

beforeEach(() => {
  // モックがある場合はここで初期化
  vi.clearAllMocks();
});

afterEach(() => {
  // クリーンアップ処理があればここに記述
});

afterAll(() => {
  // テストの最後に実行したい処理があればここに記述
});

describe("関数名", () => {
  test("正常系：テストケース名", () => {
    // arrange
    // act
    // assert
  });

  test("異常系：テストケース名", () => {
    // arrange
    // act
    // assert
  });

  test("エッジケース：テストケース名", () => {
    // arrange
    // act
    // assert
  });
});
