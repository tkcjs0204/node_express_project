
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;  // 사용할 포트 설정
const PROTOCOL = "http";  // 프로토콜 설정

app.use(express.json());

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./database.db');

app.listen(PORT, () => {
  console.log(`서버가 ${PROTOCOL}://localhost:${PORT} 에서 실행`);
});

app.post('/articles', (req, res) => {
  const { title, content } = req.body;

  db.run(`INSERT INTO articles (title, content) VALUES (?, ?)`,
    [title, content],
    function(err) {
      if (err) {
        return res.status(500).json({error: err.message});
      }
      res.json({id: this.lastID, title, content});
    });
});


app.get('/articles', (req, res) => {
  db.all(`SELECT * FROM articles`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({error: err.message});
    }
    res.json(rows);
  });
});

app.get('/articles/:id', (req, res) => {
  const id = req.params.id;

  db.get(`SELECT * FROM articles WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({error: err.message});
    }
    if (!row) {
      return res.status(404).json({error: "데이터가 없습니다."});
    }
    res.json(row);
  });
});

app.put('/articles/:id', (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body;

  db.run(`UPDATE articles SET title = ?, content = ? WHERE id = ?`,
    [title, content, id],
    function(err) {
      if (err) {
        return res.status(500).json({error: err.message});
      }
      if (this.changes === 0) {
        return res.status(404).json({error: "수정할 데이터가 없습니다."});
      }
      res.json({id, title, content});
    });
});


app.delete('/articles/:id', (req, res) => {
  const id = req.params.id;

  db.run(`DELETE FROM articles WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(500).json({error: err.message});
    }
    if (this.changes === 0) {
      return res.status(404).json({error: "삭제할 데이터가 없습니다."});
    }
    res.json({message: "삭제 완료!"});
  });
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('데이터베이스 연결 종료');
    }
    process.exit(0);
  });
});

