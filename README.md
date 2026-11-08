# 🗺️ WebGIS Lab

公開元：[aki-imaoka/webgis-lab](https://github.com/aki-imaoka/webgis-lab)

aki-imaoka のWebGISプロジェクト集です。地図を使った実験や、森林・地形を読み解く道具を、テーマごとに追加していきます。

## 🌱 プロジェクト

- **広葉樹の流通シミュレーション**（`projects/webgis-timber/`、v0.13.1）：4つの立場から、調達先・運送費・費用や収支を比較します。広島県周辺の公開GISと架空の在庫・事業者・料金を使った実験用デモです。前提とデータの出典は作品内の `sources.html` に記載しています。

公開サイトは https://aki-imaoka.github.io/webgis-lab/ です。閲覧にはcloneやNode.jsは不要です。

## ▶️ 手元で開く

Node.js が入っている環境で `start.cmd` を実行するか、コマンドプロンプトで次を実行します。追加パッケージやビルドは不要です。

```cmd
git clone https://github.com/aki-imaoka/webgis-lab.git
cd webgis-lab
node server.mjs
```

既にclone済みなら、保存先で `node server.mjs` だけを実行します。ブラウザで http://127.0.0.1:4187/webgis-lab/ を開きます。終了はサーバー画面で Ctrl+C です。Windowsでポートが使用中の場合は `set PORT=4188` の後で起動します。

背景地図の取得にはインターネット接続が必要です。ローカルURLは他のPCから開けないため、他の人への共有には公開サイトのURLを使います。

## 📂 構成と入力

```text
index.html                 プロジェクト一覧
assets/                    一覧のスタイル・装飾画像
projects/
  webgis-timber/            広葉樹の流通（単一HTML・出典・ライセンス）
server.mjs / start.cmd      ローカル確認用
```

公開するページはHTML・CSS・JavaScriptです。主要入力は架空の在庫・料金、加工済みの公開GIS、国土地理院の公開タイルと、利用者が指定する試算条件です。サーバーへのユーザーデータ保存や外部APIキーは使いません。座標は緯度・経度、地図の投影は EPSG:3857 です。

## ➕ プロジェクトを追加する

1. `projects/` に英数字とハイフンでフォルダを作り、`index.html` と必要なファイルを置きます。
2. トップの `index.html` にある `<article class="project">` を複製し、リンク・タイトル・説明を変更します。
3. このREADMEの作品一覧を更新し、作品ごとにデータの出典・利用条件・時点を記載します。
4. ローカルでトップから作品を開き、作品から一覧へ戻れること、スマートフォン幅でも操作できることを確認します。

作品から一覧へ戻るリンクは `../../` とします。画像・CSS・JSも相対URLにし、公開サイトのサブパスで動くようにします。公開するデータは利用条件と公開範囲を確認して作品内に置きます。個人情報、非公開の研究データ、`.env`、仮想環境は含めません。ローカル専用資料はGit除外の `_local/` を使います。

「広葉樹の流通」は、計算処理・架空データ・加工済みGISを内蔵した単一HTMLを公開しています。更新時は新しいHTMLを作品の `index.html` に反映し、一覧へのリンク・出典・ライセンスを保持してください。原データ、過去版、開発用作業記録は公開ファイルに含めません。

## 🌐 GitHub Pages の公開設定

リポジトリへの commit・push 後、GitHub の **Settings → Pages** で次を指定します。

- Source：**Deploy from a branch**
- Branch：**main**、フォルダ：**/ (root)**

設定・デプロイが完了すると、公開先は https://aki-imaoka.github.io/webgis-lab/ になります。`.nojekyll` を置いて、静的ファイルをそのまま配信する構成です。

公式手順：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 📖 外部コード・データ

確認日：2026-11-08。用途：ブラウザ上のWebGIS閲覧と、GitHub Pages向けの静的ファイル準備。

| 対象 | 版・取得元 | 条件と対応 |
| --- | --- | --- |
| Leaflet | 1.9.4、https://github.com/Leaflet/Leaflet/tree/v1.9.4 | BSD-2-Clause。木材流通アプリのHTML内と `projects/webgis-timber/LICENSE-Leaflet.txt` にライセンスを保持。 |
| 地理院タイル | pale、https://maps.gsi.go.jp/development/ichiran.html | 地図に出典リンク、作品の `sources.html` に利用情報を掲載。タイル画像は同梱しない。 |
| 木材流通の公開GIS | 国土数値情報の道路2024年度・標高傾斜度2011年度、林野庁の森林資源・森林区域、環境省の現存植生図2024 | 加工済みの参考経路・3山周辺2kmのレイヤ等を単一HTMLへ同梱。提供者・利用条件・加工内容は `projects/webgis-timber/sources.html` に掲載。架空在庫・仮料金とは区別する。 |

外部ライブラリ・データには、それぞれの利用条件が適用されます。このリポジトリの自作部分の公開ライセンスは未設定です。

## 🔄 改訂履歴

- 2026-11-08：本人の希望により「地図の窓」を一覧と公開ファイルから削除。「広葉樹の流通」を継続公開。
- 2026-11-08：2作目「広葉樹の流通シミュレーション」v0.13.1と出典ページを追加。計算処理・内蔵データを保持し、一覧へ戻るリンクを追加。
- 2026-11-08：複数作品を追加できる一覧ページ、最初の地図、ローカル確認用サーバー、追加・公開手順を作成。
