const express = require("express");
const app = express();
const PORT = 3000;
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

app.use(express.json());
// 데이터베이스 연결
const db = new sqlite3.Database('./database.db');



const cors = require('cors');
app.use(cors());

// ✅ JSON 데이터를 다루기 위한 미들웨어 추가
app.use(express.json());

const users =  [
  {
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "signup_date": "2023-03-18T12:00:00Z"
  },
  {
    "id": 2,
    "name": "김철수",
    "email": "kim@example.com",
    "signup_date": "2023-02-17T09:30:00Z"
  },
  {
    "id": 3,
    "name": "이영희",
    "email": "lee@example.com",
    "signup_date": "2022-11-16T15:20:00Z"
  },
  {
    "id": 4,
    "name": "박준호",
    "email": "park@example.com",
    "signup_date": "2022-10-15T10:10:00Z"
  },
  {
    "id": 5,
    "name": "최민수",
    "email": "choi@example.com",
    "signup_date": "2022-09-14T18:45:00Z"
  },
  {
    "id": 6,
    "name": "정다은",
    "email": "jung@example.com",
    "signup_date": "2022-08-13T14:00:00Z"
  },
  {
    "id": 7,
    "name": "김지수",
    "email": "kim2@example.com",
    "signup_date": "2022-07-12T11:30:00Z"
  },
  {
    "id": 8,
    "name": "이수민",
    "email": "lee2@example.com",
    "signup_date": "2022-06-11T17:15:00Z"
  },
  {
    "id": 9,
    "name": "박지현",
    "email": "park2@example.com",
    "signup_date": "2022-05-10T08:40:00Z"
  },
  {
    "id": 10,
    "name": "최지우",
    "email": "choi2@example.com",
    "signup_date": "2022-04-09T20:00:00Z"
  }
];

const articles = [
  {
    "id": 1,
    "title": "첫 번째 게시글 제목",
    "content": "첫 번째 게시글 내용입니다.",
    "author_id": 1,
    "date": "2025-03-18T12:00:00Z"
  },
  {
    "id": 2,
    "title": "두 번째 게시글 제목",
    "content": "두 번째 게시글 내용입니다.",
    "author_id": 2,
    "date": "2025-03-17T09:30:00Z"
  },
  {
    "id": 3,
    "title": "세 번째 게시글 제목",
    "content": "세 번째 게시글 내용입니다.",
    "author_id": 3,
    "date": "2025-03-16T15:20:00Z"
  },
  {
    "id": 4,
    "title": "네 번째 게시글 제목",
    "content": "네 번째 게시글 내용입니다.",
    "author_id": 4,
    "date": "2025-03-15T10:10:00Z"
  },
  {
    "id": 5,
    "title": "다섯 번째 게시글 제목",
    "content": "다섯 번째 게시글 내용입니다.",
    "author_id": 5,
    "date": "2025-03-14T18:45:00Z"
  },
  {
    "id": 6,
    "title": "여섯 번째 게시글 제목",
    "content": "여섯 번째 게시글 내용입니다.",
    "author_id": 6,
    "date": "2025-03-13T14:00:00Z"
  },
  {
    "id": 7,
    "title": "일곱 번째 게시글 제목",
    "content": "일곱 번째 게시글 내용입니다.",
    "author_id": 7,
    "date": "2025-03-12T11:30:00Z"
  },
  {
    "id": 8,
    "title": "여덟 번째 게시글 제목",
    "content": "여덟 번째 게시글 내용입니다.",
    "author_id": 8,
    "date": "2025-03-11T17:15:00Z"
  },
  {
    "id": 9,
    "title": "아홉 번째 게시글 제목",
    "content": "아홉 번째 게시글 내용입니다.",
    "author_id": 9,
    "date": "2025-03-10T08:40:00Z"
  },
  {
    "id": 10,
    "title": "열 번째 게시글 제목",
    "content": "열 번째 게시글 내용입니다.",
    "author_id": 10,
    "date": "2025-03-09T20:00:00Z"
  }
];

// 서버 확인용
app.get("/", (req, res) => {
  res.send("서버가 정상적으로 실행 중입니다!");
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

// 모든 사용자 목록 조회
app.get("/users", (req, res) => {
  res.json(users);
});

// 특정 사용자 조회
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// 모든 게시글 목록 조회
app.get("/articles", (req, res) => {
  res.json(articles);
});

// 특정 게시글 조회
app.get("/articles/:id", (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});

// 게시글 생성 (POST /articles)
app.post("/articles", (req, res) => {
  const { title, content, author_id } = req.body;

  if (!author_id) {
    return res.status(400).json({ error: "Author ID is required" });
  }

  // 유효한 user_id인지 확인
  const user = users.find(u => u.id === parseInt(author_id));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newArticle = {
    id: articles.length + 1, // 새 게시글 ID는 기존 게시글 수 + 1
    title,
    content,
    author_id,
    date: new Date().toISOString(),
  };
  articles.push(newArticle); // 새 게시글을 배열에 추가
  res.status(201).json({
    message: "Article created successfully",
    article: newArticle,
  });
});

// 게시글 수정 (PUT /articles/:id)
app.put("/articles/:id", (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: "Article not found" });

  const { title, content, author_id } = req.body;
  article.title = title || article.title; // 수정된 제목
  article.content = content || article.content; // 수정된 내용
  article.author_id = author_id || article.author_id; // 수정된 작성자 ID (없으면 기존 값 유지)
  article.date = new Date().toISOString(); // 수정된 날짜 업데이트

  res.json({
    message: "Article updated successfully",
    article,
  });
});

// 게시글 삭제 (DELETE /articles/:id)
app.delete("/articles/:id", (req, res) => {
  const articleIndex = articles.findIndex(a => a.id === parseInt(req.params.id));
  if (articleIndex === -1) return res.status(404).json({ error: "Article not found" });

  articles.splice(articleIndex, 1); // 게시글 삭제
  res.json({ message: "Article deleted successfully" });
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




// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
