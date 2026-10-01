# 第7回 ミナミの綾野剛コンペ

`index.html`（大会ページ）と `entry.html`（参加申込ページ）が本番サイト。CSS は `css/style.css` を両ページで共有する（外部依存は Google Fonts のみ）。
B案（深夜ミナミ風）の構成をベースに、A案のブラック＋ゴールドの配色とウッド調を加えたデザイン。

制作指示書・デザイン指示書はリポジトリ直下の `.md` を参照。

## 構成

| ファイル | 内容 |
| --- | --- |
| `index.html` | 大会ページ（第7回 参加者募集中） |
| `entry.html` | 参加申込ページ（次回以降に使う予定。第7回は調整さんを使うため未リンク） |
| `css/style.css` | 両ページ共通のスタイル |
| `js/entry.js` | 参加申込ページの処理（GAS との通信） |
| `designs.html` | 旧デザイン案（Type A / B / C）の比較トップ |
| `type-a.html` / `type-b.html` / `type-c.html` | 旧デザイン案 |
| `images/emblems/` | 旧デザイン案のエンブレム画像 |
| `images/icon/` | ロゴ（logo.webp）・favicon・apple-touch-icon・OGP・QRコード |
| `gas/Code.gs` | 参加申込フォームの保存先（Google Apps Script） |

## 未確定項目の洗い出し

リポジトリ全体を `【` で全文検索すると、差し替え待ちの箇所が一覧できます。

## 参加申込フォーム（GAS）

> 第7回は調整さん（https://chouseisan.com/s?h=da16d62ac5cc4ad8a627158d94ee1235 ）で受け付ける。
> 自作フォームは次回以降に使う予定で、`index.html` の Entry ボタンはまだ `entry.html` を指していない。
> 切り替えるときは、GAS をデプロイして `ENTRY_API_URL` を設定し、Entry ボタン3か所（ヘッダー・ヒーロー・Entryセクション）のリンク先を `entry.html` に変える。

調整さんの代わりに、参加申込ページ（`entry.html`）で参加可否（ゴルフ／表彰式・2次会の ○△×）を受け付ける。
回答は Google スプレッドシートに保存され、申込ページの参加者一覧に表示名とコメントが公開される。
LINE などで申込を案内するときは https://kei-soeda.github.io/minami-ayano-go-cup/entry.html を送る。
サイトは `noindex` を指定しており、検索エンジンには表示されない。

### 初回セットアップ

1. Google スプレッドシートを新規作成する（名前は自由。例：「綾野剛コンペ 第7回 回答」）
2. メニューの「拡張機能 → Apps Script」を開き、`gas/Code.gs` の内容をすべて貼り付けて保存する
3. 新着通知メールが欲しい場合は、`NOTIFY_EMAIL` に通知先のアドレスを入れる
4. 「デプロイ → 新しいデプロイ」で種類に「ウェブアプリ」を選び、次の設定でデプロイする
   - 次のユーザーとして実行：自分
   - アクセスできるユーザー：全員
5. 初回は Google アカウントの承認画面が出るので許可する
6. 表示されたウェブアプリの URL（`https://script.google.com/macros/s/.../exec`）を、
   `js/entry.js` の `ENTRY_API_URL` に設定してプッシュする

回答はスプレッドシートの「回答」シートに1行ずつ追加される（最初の回答時に自動で作成）。

### 運用メモ

- `Code.gs` を修正したら「デプロイ → デプロイを管理 → 編集 → バージョン：新バージョン」で更新する（URL は変わらない）
- 調整さんと同じく、誰でも一覧の名前を押して回答を変更・削除できる。いたずらがあった場合はスプレッドシートから直接直す
- 次の回に使うときは、「回答」シートの名前を変える（例：「第7回」）と、新しい「回答」シートが自動で作られる

## 公開 URL

- 本番: https://kei-soeda.github.io/minami-ayano-go-cup/
- 旧デザイン案: https://kei-soeda.github.io/minami-ayano-go-cup/designs.html

## ローカル確認

リポジトリ直下で静的サーバーを起動してください。

```bash
python3 -m http.server 8080
```

ブラウザで http://localhost:8080/ を開きます。
