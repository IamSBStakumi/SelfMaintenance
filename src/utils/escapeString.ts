const escapeString = (str: string): string =>
  str
    .replace(/\\/g, "\\\\") // バックスラッシュ
    .replace(/\n/g, "\\n") // 改行コード
    .replace(/\r/g, "\\r") // キャリッジリターン
    .replace(/&/g, "&amp;") // 以下、3つHTMLエスケープ(XSS対策)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;") // ダブルクォート
    .replace(/'/g, "&#039;"); // シングルクォート

export default escapeString;
