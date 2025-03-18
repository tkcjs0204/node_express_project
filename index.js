const express = require('express');
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/tic', (req, res) => {
  res.send('teg');
});

app.get('/abc', (req, res) => {
  res.send('def');
});

app.get('/user', (req, res) => {
  res.send('users');
});