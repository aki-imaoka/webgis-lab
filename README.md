# 🗺️ WebGIS Lab

公開元：[aki-imaoka/webgis-lab](https://github.com/aki-imaoka/webgis-lab)

aki-imaoka のWebGISプロジェクト集です。地図を使った実験や、森林・地形を読み解く道具を、テーマごとに追加していきます。

## 🌱 最初のプロジェクト

- **地図の窓**（`projects/gsi-viewer/`）：標準地図・淡色地図・航空写真の切り替え、座標移動、距離計測、表示位置の共有。
- データの出典・撮影時期・距離の定義・現在地の扱いは、作品内の `sources.html` に記載しています。

## ▶️ 手元で開く

Node.js が入っている環境で `start.cmd` を実行するか、コマンドプロンプトで次を実行します。追加パッケージやビルドは不要です。

```cmd
git clone https://github.com/aki-imaoka/webgis-lab.git
cd webgis-lab
node server.mjs
```

既にclone済みなら、保存先で `node server.mjs` だけを実行します。ブラウザで http://127.0.0.1:4187/webgis-lab/ を開きます。終了はサーバー画面で Ctrl+C です。Windowsでポートが使用中の場合は `set PORT=4188` の後で起動します。

地図の取得にはインターネット接続が必要です。現在地やクリップボードはブラウザの許可・対応状況によって使えない場合があります。ローカルURLは他のPCから開けないため、他の人への共有には公開サイトのURLを使います。

## 📂 構成と入力

```text
index.html                 プロジェクト一覧
assets/                    一覧のスタイル・装飾画像
projects/
  gsi-viewer/               地図の窓（HTML・CSS・JS・出典・Leaflet）
server.mjs / start.cmd      ローカル確認用
```

公開するページはHTML・CSS・JavaScriptです。主要入力は国土地理院の公開タイルと、利用者が指定する座標です。サーバーへのユーザーデータ保存や外部APIキーは使いません。座標は緯度・経度、地図の投影は EPSG:3857 です。

## ➕ プロジェクトを追加する

1. `projects/` に英数字とハイフンでフォルダを作り、`index.html` と必要なファイルを置きます。
2. トップの `index.html` にある `<article class="project">` を複製し、リンク・タイトル・説明を変更します。
3. このREADMEの作品一覧を更新し、作品ごとにデータの出典・利用条件・時点を記載します。
4. ローカルでトップから作品を開き、作品から一覧へ戻れること、スマートフォン幅でも操作できることを確認します。

作品から一覧へ戻るリンクは `../../` とします。画像・CSS・JSも相対URLにし、公開サイトのサブパスで動くようにします。公開するデータは利用条件と公開範囲を確認して作品内に置きます。個人情報、非公開の研究データ、`.env`、仮想環境は含めません。ローカル専用資料はGit除外の `_local/` を使います。

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
| 地図の窓 | 既存の本人用アプリ（2026-11-01作成版） | 一覧へ戻るリンクを追加。 |
| Leaflet | 1.9.4、https://github.com/Leaflet/Leaflet/tree/v1.9.4 | 既存アプリに同梱されたJS・CSS・ライセンスを再利用。BSD-2-Clause。`projects/gsi-viewer/vendor/LICENSE-Leaflet.txt` の表示を保持。標準マーカー画像を使わない構成。 |
| 地理院タイル | std / pale / seamlessphoto、https://maps.gsi.go.jp/development/ichiran.html | 公式のリアルタイム読込みの案内を確認。地図に出典リンク、`sources.html` に追加出典を掲載。タイル画像は同梱しない。 |

外部ライブラリ・データには、それぞれの利用条件が適用されます。このリポジトリの自作部分の公開ライセンスは未設定です。

## 🔄 改訂履歴

- 2026-11-08：複数作品を追加できる一覧ページ、最初の地図、ローカル確認用サーバー、追加・公開手順を作成。
