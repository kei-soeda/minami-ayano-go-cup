# 第7回 ミナミの綾野剛コンペ

`index.html` が本番サイト（HTML・CSS・JS を1ファイルにまとめた構成、外部依存は Google Fonts のみ）。
B案（深夜ミナミ風）の構成をベースに、A案のブラック＋ゴールドの配色とウッド調を加えたデザイン。

制作指示書・デザイン指示書はリポジトリ直下の `.md` を参照。

## 構成

| ファイル | 内容 |
| --- | --- |
| `index.html` | 本番サイト（第7回 参加者募集中） |
| `designs.html` | 旧デザイン案（Type A / B / C）の比較トップ |
| `type-a.html` / `type-b.html` / `type-c.html` | 旧デザイン案 |
| `images/emblems/` | 旧デザイン案のエンブレム画像 |
| `images/icon/` | ロゴ（logo.webp）・favicon・apple-touch-icon・OGP・QRコード |

## 未確定項目の洗い出し

`index.html` を `【` で全文検索すると、差し替え待ちの箇所が一覧できます。

## 公開 URL

- 本番: https://kei-soeda.github.io/minami-ayano-go-cup/
- 旧デザイン案: https://kei-soeda.github.io/minami-ayano-go-cup/designs.html

## ローカル確認

リポジトリ直下で静的サーバーを起動してください。

```bash
python3 -m http.server 8080
```

ブラウザで http://localhost:8080/ を開きます。
