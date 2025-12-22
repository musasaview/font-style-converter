# font-style-converter プロジェクト

このプロジェクトはBunを使用したReactフロントエンドアプリケーションです。英数字の見た目を様々なスタイルに変換するWebツールを提供しています。

## プロジェクト概要

- **目的**: 文字列の見た目を変換するツール(Bold, Italic, Circledなど様々なUnicodeスタイル)
- **技術スタック**: Bun + React 19 + TypeScript + Tailwind CSS
- **特徴**: 完全クライアントサイド処理(サーバーに送信しない)

## 開発環境

### 基本コマンド

- `bun --hot src/index.ts` - 開発サーバー起動(HMR有効)
- `bun test` - テスト実行
- `bun run build` - プロダクションビルド

### Bunの使用

Default to using Bun instead of Node.js:

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install`
- Use `bun run <script>` instead of `npm run <script>`

## プロジェクト構造

```
src/
├── index.html          # エントリーポイントHTML
├── index.ts            # Bun.serve()サーバー設定
├── frontend.tsx        # Reactアプリケーション本体
├── style.css           # スタイルシート(Tailwind CSS)
└── lib/
    ├── character-maps.ts   # 文字変換マップとスタイル定義
    ├── converter.ts        # 文字変換ロジック
    └── converter.test.ts   # テストコード
```

## サーバー設定 (src/index.ts)

```ts
import index from "./index.html";

Bun.serve({
  routes: {
    "/": index,
  },
  development: {
    hmr: true,      // Hot Module Reloadingを有効化
    console: true,  // ブラウザコンソール出力
  },
  port: 3000,
});
```

## フロントエンド

HTMLファイルから直接`.tsx`ファイルをインポートし、Bunの組み込みバンドラーが自動的にトランスパイル・バンドルします。

```html
<div id="root"></div>
<script type="module" src="./frontend.tsx"></script>
```

## テスト

`bun:test`を使用:

```ts
import { test, expect } from "bun:test";

test("convertText converts characters correctly", () => {
  const result = convertText("ABC", STYLES.bold);
  expect(result).toBe("𝐀𝐁𝐂");
});
```

## 主要な機能

1. **文字スタイル変換**: Bold, Italic, Script, Fraktur, Monospace, Sans-serif, Double-struck, Circledなど
2. **ケース変換**: 大文字/小文字/反転
3. **幅変換**: 全角/半角
4. **濁点追加**: 結合文字/半角濁点
5. **改行対応**: 複数行テキストの変換に対応(各行ごとに処理)

## 依存関係

- `react` & `react-dom`: ^19
- `conv-str-width`: 全角半角変換(カスタムフォーク版)
- `react-icons`: アイコン
- `tailwindcss`: ^4.1.11
- `bun-plugin-tailwind`: Tailwind CSS統合
