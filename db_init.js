const sqlite3 = require('sqlite3').verbose();

// SQLite DB 연결
const db = new sqlite3.Database('./database.db');

// 테이블 준비 함수
function initDB() {
  db.serialize(() => {
    // articles 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error("테이블 생성 에러:", err);
      } else {
        console.log("테이블 준비 완료(articles)");
      }
    });

    // users 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('테이블 생성 실패:', err);
      } else {
        console.log('users 테이블 생성 완료');
      }
    });
  });

  // 모든 작업이 끝난 후 데이터베이스 연결 종료
  db.close((err) => {
    if (err) {
      console.error("DB 닫기 실패:", err);
    } else {
      console.log("DB 연결 종료");
    }
  });
}

// 함수 실행
initDB();
