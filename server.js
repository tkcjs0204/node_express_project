const express = require("express");
const app = express();
const PORT = 3000;
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

app.use(express.json());
app.use(cors());

// 데이터베이스 연결
const db = new sqlite3.Database('./database.db');

// 서버 확인용
app.get("/", (req, res) => {
  res.send("서버가 정상적으로 실행 중입니다!");
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

// 모든 사용자 목록 조회
app.get("/users", (req, res) => {
  db.all('SELECT id, email, created_at FROM users', [], (err, users) => {
    if (err) {
      console.error('사용자 목록 조회 에러:', err);
      return res.status(500).json({ error: '사용자 목록 조회 중 오류가 발생했습니다.' });
    }
    res.json(users);
  });
});

// 특정 사용자 조회
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  db.get('SELECT id, email, created_at FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('사용자 조회 에러:', err);
      return res.status(500).json({ error: '사용자 조회 중 오류가 발생했습니다.' });
    }
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  });
});

// 모든 게시글 목록 조회
app.get("/articles", (req, res) => {
  db.all(`
    SELECT a.*, u.email as author_email 
    FROM articles a 
    JOIN users u ON a.user_id = u.id 
    ORDER BY a.created_at DESC
  `, [], (err, articles) => {
    if (err) {
      console.error('게시글 목록 조회 에러:', err);
      return res.status(500).json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' });
    }
    res.json(articles);
  });
});

// 특정 게시글 조회
app.get("/articles/:id", (req, res) => {
  const articleId = req.params.id;
  db.get(`
    SELECT a.*, u.email as author_email 
    FROM articles a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.id = ?
  `, [articleId], (err, article) => {
    if (err) {
      console.error('게시글 조회 에러:', err);
      return res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
    }
    if (!article) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    res.json(article);
  });
});

// 게시글 작성
app.post("/articles", authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.userId;

  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용을 모두 입력해주세요.' });
  }

  db.run(
    'INSERT INTO articles (title, content, user_id, created_at) VALUES (?, ?, ?, datetime("now"))',
    [title, content, userId],
    function(err) {
      if (err) {
        console.error('게시글 작성 에러:', err);
        return res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' });
      }
      
      // 작성된 게시글 정보 조회
      db.get(`
        SELECT a.*, u.email as author_email 
        FROM articles a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.id = ?
      `, [this.lastID], (err, article) => {
        if (err) {
          console.error('게시글 정보 조회 에러:', err);
          return res.status(500).json({ error: '게시글 정보 조회 중 오류가 발생했습니다.' });
        }
        res.status(201).json(article);
      });
    }
  );
});

// 게시글 수정
app.put("/articles/:id", authenticateToken, (req, res) => {
  const articleId = req.params.id;
  const { title, content } = req.body;
  const userId = req.user.userId;

  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용을 모두 입력해주세요.' });
  }

  db.get('SELECT user_id FROM articles WHERE id = ?', [articleId], (err, article) => {
    if (err) {
      console.error('게시글 조회 에러:', err);
      return res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
    }
    if (!article) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    if (article.user_id !== userId) {
      return res.status(403).json({ error: '게시글을 수정할 권한이 없습니다.' });
    }

    db.run(
      'UPDATE articles SET title = ?, content = ? WHERE id = ?',
      [title, content, articleId],
      (err) => {
        if (err) {
          console.error('게시글 수정 에러:', err);
          return res.status(500).json({ error: '게시글 수정 중 오류가 발생했습니다.' });
        }
        res.json({ message: '게시글이 성공적으로 수정되었습니다.' });
      }
    );
  });
});

// 게시글 삭제
app.delete("/articles/:id", authenticateToken, (req, res) => {
  const articleId = req.params.id;
  const userId = req.user.userId;

  db.get('SELECT user_id FROM articles WHERE id = ?', [articleId], (err, article) => {
    if (err) {
      console.error('게시글 조회 에러:', err);
      return res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
    }
    if (!article) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    if (article.user_id !== userId) {
      return res.status(403).json({ error: '게시글을 삭제할 권한이 없습니다.' });
    }

    db.run('DELETE FROM articles WHERE id = ?', [articleId], (err) => {
      if (err) {
        console.error('게시글 삭제 에러:', err);
        return res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
      }
      res.json({ message: '게시글이 성공적으로 삭제되었습니다.' });
    });
  });
});

app.post('/users', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  }

  // 이메일 중복 확인
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.get(checkEmailQuery, [email], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '이메일 중복 확인 실패' });
    }
    
    if (row) {
      return res.status(400).json({ error: '이메일이 이미 존재합니다.' });
    }

    // 비밀번호 해싱
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '비밀번호 해싱 실패' });
      }

      const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
      db.run(query, [email, hashedPassword], function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: '회원가입 실패' });
        }
        res.status(200).json({ message: '회원가입 성공' });
      });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호는 필수입니다.' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
    }
    if (!user) {
      return res.status(404).json({ error: '이메일이 없습니다.' });
    }

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '패스워드가 틀립니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'your_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: '로그인 성공',
      token: token, // 클라이언트는 이 토큰을 저장하고 요청에 사용
    });
  });
});

// 회원가입 처리 (POST /signup)
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  }

  // 이메일 중복 확인
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.get(checkEmailQuery, [email], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '이메일 중복 확인 실패' });
    }
    
    if (row) {
      return res.status(400).json({ error: '이메일이 이미 존재합니다.' });
    }

    // 비밀번호 해싱
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '비밀번호 해싱 실패' });
      }

      const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
      db.run(query, [email, hashedPassword], function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: '회원가입 실패' });
        }
        res.status(200).json({ message: '회원가입 성공' });
      });
    });
  });
});

// 댓글 목록 조회
app.get("/articles/:id/comments", (req, res) => {
  const articleId = req.params.id;
  db.all(`
    SELECT c.*, u.email as author_email 
    FROM comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.article_id = ? 
    ORDER BY c.created_at ASC
  `, [articleId], (err, comments) => {
    if (err) {
      console.error('댓글 목록 조회 에러:', err);
      return res.status(500).json({ error: '댓글 목록 조회 중 오류가 발생했습니다.' });
    }
    res.json(comments);
  });
});

// 댓글 작성
app.post("/articles/:id/comments", authenticateToken, (req, res) => {
  const articleId = req.params.id;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content) {
    return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
  }

  // 게시글 존재 여부 확인
  db.get('SELECT id FROM articles WHERE id = ?', [articleId], (err, article) => {
    if (err) {
      console.error('게시글 조회 에러:', err);
      return res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
    }
    if (!article) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 댓글 작성
    db.run(
      'INSERT INTO comments (content, article_id, user_id, created_at) VALUES (?, ?, ?, datetime("now"))',
      [content, articleId, userId],
      function(err) {
        if (err) {
          console.error('댓글 작성 에러:', err);
          return res.status(500).json({ error: '댓글 작성 중 오류가 발생했습니다.' });
        }
        
        // 작성된 댓글 정보 조회
        db.get(`
          SELECT c.*, u.email as author_email 
          FROM comments c 
          JOIN users u ON c.user_id = u.id 
          WHERE c.id = ?
        `, [this.lastID], (err, comment) => {
          if (err) {
            console.error('댓글 정보 조회 에러:', err);
            return res.status(500).json({ error: '댓글 정보 조회 중 오류가 발생했습니다.' });
          }
          res.status(201).json(comment);
        });
      }
    );
  });
});

// 댓글 수정
app.put("/articles/:id/comments/:commentId", authenticateToken, (req, res) => {
  const articleId = req.params.id;
  const commentId = req.params.commentId;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
  }

  db.get('SELECT user_id FROM comments WHERE id = ? AND article_id = ?', [commentId, articleId], (err, comment) => {
    if (err) {
      console.error('댓글 조회 에러:', err);
      return res.status(500).json({ error: '댓글 조회 중 오류가 발생했습니다.' });
    }
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    if (comment.user_id !== userId) {
      return res.status(403).json({ error: '댓글을 수정할 권한이 없습니다.' });
    }

    db.run(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, commentId],
      (err) => {
        if (err) {
          console.error('댓글 수정 에러:', err);
          return res.status(500).json({ error: '댓글 수정 중 오류가 발생했습니다.' });
        }
        res.json({ message: '댓글이 성공적으로 수정되었습니다.' });
      }
    );
  });
});

// 댓글 삭제
app.delete("/articles/:id/comments/:commentId", authenticateToken, (req, res) => {
  const articleId = req.params.id;
  const commentId = req.params.commentId;
  const userId = req.user.id;

  db.get('SELECT user_id FROM comments WHERE id = ? AND article_id = ?', [commentId, articleId], (err, comment) => {
    if (err) {
      console.error('댓글 조회 에러:', err);
      return res.status(500).json({ error: '댓글 조회 중 오류가 발생했습니다.' });
    }
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    if (comment.user_id !== userId) {
      return res.status(403).json({ error: '댓글을 삭제할 권한이 없습니다.' });
    }

    db.run('DELETE FROM comments WHERE id = ?', [commentId], (err) => {
      if (err) {
        console.error('댓글 삭제 에러:', err);
        return res.status(500).json({ error: '댓글 삭제 중 오류가 발생했습니다.' });
      }
      res.json({ message: '댓글이 성공적으로 삭제되었습니다.' });
    });
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
