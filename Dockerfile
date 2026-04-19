# ベースイメージとして軽量な alpine を使用し、Node.js 24.15.0を指定
FROM node:24.15.0-alpine

# Next.js等のネイティブモジュール互換性のために libc6-compat をインストール
RUN apk add --no-cache libc6-compat

# 作業ディレクトリの指定
WORKDIR /app

# 依存パッケージ情報のコピー
COPY package.json yarn.lock ./

# パッケージのインストール
RUN yarn install --frozen-lockfile

# ソースコードをコンテナ内にコピー
COPY . .

# 開発用サーバーのポート
EXPOSE 3000

# 開発モードでNext.jsを起動
CMD ["yarn", "dev"]
