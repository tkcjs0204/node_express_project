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

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/test", (req, res) => {
  console.log(req.query);
  res.json(ok);
});

console.log()


app.get('/articles' , (req, res) => {
  console.log(req.query);
});



app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

  
app.get("/ping", (req, res) => res.send("pong"));
app.get("/tic", (req, res) => res.send("teg"));
app.get("/abc", (req, res) => res.send("def"));


app.get("/users", (req, res) => {
  res.json(users);
});


app.get("/articles", (req, res) => {
  res.json(articles);
});


app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});


app.get("/articles/:id", (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});











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
]


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
]


