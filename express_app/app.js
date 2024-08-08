const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const { users, findUserByUsername, findUserById, addUser } = require('./users');
const { ensureAuthenticated } = require('./auth');

const app = express();

// Configure session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
    const user = findUserByUsername(username);
    if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
    }
    bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password.' });
        }
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = findUserById(id);
    done(null, user);
});

app.set('view engine', 'ejs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', ensureAuthenticated, (req, res) => {
    res.render('index', { user: req.user, images: getUploadedImages() });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
}));

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    addUser(username, hashedPassword);
    res.redirect('/login');
});

app.post('/upload', ensureAuthenticated, upload.single('file'), (req, res) => {
    res.redirect('/');
});

app.post('/delete/:filename', ensureAuthenticated, (req, res) => {
    const filepath = path.join(__dirname, 'public/uploads', req.params.filename);
    fs.unlink(filepath, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting file');
        } else {
            res.redirect('/');
        }
    });
});

function getUploadedImages() {
    const directoryPath = path.join(__dirname, 'public/uploads');
    return fs.readdirSync(directoryPath).map(file => `/uploads/${file}`);
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
