const express = require('express');
const path = require('path');
const multer = require('multer');
const ejs = require('ejs');
const session = require('express-session');
const fs = require('fs');
const app = express();

// Multerのストレージ設定
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/images'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Expressの設定
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// セッション設定
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// ダミーの認証ミドルウェア（後で実装する必要あり）
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// ルート設定
app.get('/', ensureAuthenticated, (req, res) => {
    const images = fs.readdirSync(path.join(__dirname, 'public/images')).map(filename => ({ filename }));
    res.render('index', { images });
});

app.post('/upload', ensureAuthenticated, upload.single('image'), (req, res) => {
    res.redirect('/');
});

app.post('/delete/:filename', ensureAuthenticated, (req, res) => {
    const filePath = path.join(__dirname, 'public/images', req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    res.redirect('/');
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('ログアウトエラー:', err);
        }
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
