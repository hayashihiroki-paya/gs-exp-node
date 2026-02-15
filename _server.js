// server.js（最小版）

// まずexpressを使えるようにする
const express = require("express");

const cors = require("cors");
// → CORS: 異なるドメイン間の通信を許可
//   Next.js（localhost:3000）からAPI（localhost:5000）にアクセスできるようにする

const { PrismaClient } = require("./generated/prisma");
// → Prisma Client: データベースを操作するためのクラス
//   prisma.post.findMany() などでCRUD操作ができる

// ここで実行してappの箱の中にexpressの機能を使えるようにする
const app = express();
// 競合しないようにだけ注意
const PORT = 8888;

const prisma = new PrismaClient();
// → Prisma Client のインスタンスを作成
//   この prisma を使ってDBを操作する

// ========================================
// ミドルウェアの設定
// ========================================
// ミドルウェア = リクエストを処理する前に実行される関数
// 全てのリクエストに対して共通の処理を行う

app.use(cors());
// → CORS を許可
//   これがないと Next.js から API にアクセスできない

app.use(express.json());
// → JSON リクエストを解析
//   req.body でJSONデータを受け取れるようにする

// 動作確認用
// ココから簡単なAPIを作ります
app.get("/", (req, res) => {
    // resはresponse返答します、のこと
  res.send("<h1>おおほりは長野で研究をしています</h1>");
});

// ココからAPIを開発する流れをイメージする
app.post("/api/post", async (req, res) => {
    try{
        // ここで送られたデータを受け取ります
        const { content, imageUrl, userId } = req.body;
        // req.body = データの塊でAPIでデータが送られてくる場所
        // そこから分割代入というjsのテクニックを使って抜き出していく

        // バリデーションのチェックをしていく 本当に送られてきているか
        if (!content || content.trim() === "" ) {
            return res.this.status(400).json({
                error: "投稿の中身が空なので入力してください"
            });
        }

        // 登録の処理の場所 prismaを使ってデータを実際に登録する
        const post = await prisma.create({
            // prismaの公式の書き方で書く
            data: {
                content: content.trim(),
                imageUrl: imageUrl || null,
                userId: userId || null,
            },
        });

        // この形式をDBに登録した後に成功したという結果をstatusでお知らせとデータを戻してくれる🤗
        res.status(201).json(post);

    }catch(error){
        // エラーの書き方は変わりませんのでテンプレと思ってください🤗
        console.error("Error creating post:", error);
        res.status(500).json({ error: "投稿の作成に失敗しました" });
    }

    // この下は消さない
});

// ここでサーバーを起動させます 最後に起動する
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});