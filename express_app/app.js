const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const app = express();

// セッションの設定
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// ボディパーサーの設定
app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// ユーザー管理（簡易的なメモリ内ストレージ）
const users = {};

// ログイン処理
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.redirect('/login?error=invalid');
    }
});

// 登録処理
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.redirect('/register?error=exists');
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[username] = { username, password: hashedPassword };
    res.redirect('/login');
});

// ログアウト処理
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ログインページ
app.get('/login', (req, res) => {
    res.render('login', { error: req.query.error });
});

// 登録ページ
app.get('/register', (req, res) => {
    res.render('register', { error: req.query.error });
});

// 画像のアップロードと表示
app.get('/', (req, res) => {
    const uploadedImages = getUploadedImages();
    res.render('index', { images: uploadedImages, user: req.session.user });
});

// アップロードされた画像を取得
function getUploadedImages() {
    const imageDir = path.join(__dirname, 'public/images');
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir);
    }
    return fs.readdirSync(imageDir).map(filename => `/images/${filename}`);
}

// サーバーの開始
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
