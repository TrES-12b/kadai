const express = require('express');
const app = express();
const path = require('path');

const loggerMiddleware = function(req, res, next) {
  console.log(`[${new Date()}] ${req.method} ${req.url}`);
  next();
};

app.use(loggerMiddleware);

// 静的ファイルの提供とキャッシュの有効化
app.use(express.static('public', { maxAge: 86400000 }));

// test-imageリクエスト
app.get('/test-image', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/images/test.png'));
});

// GETリクエスト
app.get('/', (req, res) => {
  res.send({
    msg:'GET request'
  });
});

// POSTリクエスト
app.post('/', (req, res) => {
  res.send({
    msg:'POST request'
  });
});

// PUTリクエスト
app.put('/:id', (req, res) => {
  res.send({
    id: req.params.id,
    msg:'PUT request'
  });
});

// DELETEリクエスト
app.delete('/:id', (req, res) => {
  res.send({
    id: req.params.id,
    msg:'DELETE request'
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});