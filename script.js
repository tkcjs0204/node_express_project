// 상수 정의
const API_URL = 'http://localhost:3000';
const ENDPOINTS = {
  articles: `${API_URL}/articles`,
  login: `${API_URL}/login`,
  signup: `${API_URL}/signup`,
  me: `${API_URL}/me`,
  comments: (articleId) => `${API_URL}/articles/${articleId}/comments`
};

// DOM 요소 캐싱
const elements = {
  authPanel: document.getElementById('auth-panel'),
  toggleAuth: document.getElementById('toggle-auth'),
  closeAuth: document.getElementById('close-auth'),
  loginForm: document.getElementById('loginForm'),
  signupForm: document.getElementById('signupForm'),
  articleForm: document.getElementById('articleForm'),
  articlesList: document.getElementById('articlesList'),
  message: document.getElementById('message'),
  userInfo: document.getElementById('user-info'),
  editModal: document.getElementById('edit-modal'),
  closeEdit: document.getElementById('close-edit'),
  editForm: document.getElementById('edit-form'),
  logoutBtn: document.getElementById('logout-btn')
};

// 유틸리티 함수
const utils = {
  displayMessage(message, type = 'info') {
    elements.message.textContent = message;
    elements.message.className = `alert ${type}`;
    elements.message.style.display = 'block';
    
    setTimeout(() => {
      elements.message.style.display = 'none';
    }, 3000);
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  validateForm(formData) {
    const errors = [];
    for (const [key, value] of formData.entries()) {
      if (!value.trim()) {
        errors.push(`${key}를 입력해주세요.`);
      }
    }
    return errors;
  },

  showModal(modal) {
    modal.classList.remove('hidden');
  },

  hideModal(modal) {
    modal.classList.add('hidden');
  }
};

// API 요청 함수
const api = {
  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      };

      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      // 응답이 JSON이 아닌 경우 처리
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버가 응답하지 않습니다. 서버가 실행 중인지 확인해주세요.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
      }

      return data;
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        utils.displayMessage('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.', 'error');
      } else {
        utils.displayMessage(error.message, 'error');
      }
      throw error;
    }
  },

  async getArticles() {
    return this.request(ENDPOINTS.articles);
  },

  async getArticle(id) {
    return this.request(`${ENDPOINTS.articles}/${id}`);
  },

  async createArticle(articleData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('게시글을 작성하려면 로그인이 필요합니다.');
    }

    // JWT 토큰에서 사용자 정보 추출
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    
    return this.request(ENDPOINTS.articles, {
      method: 'POST',
      body: JSON.stringify({
        ...articleData,
        userId: tokenPayload.userId
      })
    });
  },

  async updateArticle(id, articleData) {
    return this.request(`${ENDPOINTS.articles}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData)
    });
  },

  async deleteArticle(id) {
    return this.request(`${ENDPOINTS.articles}/${id}`, {
      method: 'DELETE'
    });
  },

  async login(credentials) {
    return this.request(ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.username,
        password: credentials.password
      })
    });
  },

  async signup(userData) {
    return this.request(ENDPOINTS.signup, {
      method: 'POST',
      body: JSON.stringify({
        email: userData.username,
        password: userData.password
      })
    });
  },

  async getComments(articleId) {
    return this.request(ENDPOINTS.comments(articleId));
  },

  async createComment(articleId, commentData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('댓글을 작성하려면 로그인이 필요합니다.');
    }

    // JWT 토큰에서 사용자 정보 추출
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));

    return this.request(ENDPOINTS.comments(articleId), {
      method: 'POST',
      body: JSON.stringify({
        content: commentData.content,
        userId: tokenPayload.userId
      })
    });
  }
};

// UI 관련 함수
const ui = {
  displayArticles(articles) {
    if (!articles || articles.length === 0) {
      elements.articlesList.innerHTML = '<p class="no-articles">게시글이 없습니다.</p>';
      return;
    }

    elements.articlesList.innerHTML = articles.map(article => `
      <article class="article" data-id="${article.id}">
        <h3>${article.title}</h3>
        <p>${article.content}</p>
        <p><strong>작성자:</strong> ${article.author_email || '알 수 없음'}</p>
        <p><strong>작성일:</strong> ${utils.formatDate(article.created_at)}</p>
        <div class="article-actions">
          <button type="button" class="delete-btn">삭제</button>
          <button type="button" class="edit-btn" onclick="handlers.showEditForm(${article.id})">수정</button>
        </div>
        
        <!-- 댓글 섹션 -->
        <div class="comments-section">
          <h4>댓글</h4>
          <div class="comments-list" id="comments-${article.id}"></div>
          <form class="comment-form" id="comment-form-${article.id}" onsubmit="handlers.handleCommentSubmit(event, ${article.id})">
            <div class="form-group">
              <textarea name="content" placeholder="댓글을 입력하세요" required></textarea>
            </div>
            <button type="submit">댓글 작성</button>
          </form>
        </div>
      </article>
    `).join('');

    // 각 게시글의 댓글 로드
    articles.forEach(article => {
      handlers.loadComments(article.id);
    });
  },

  toggleAuthPanel(show) {
    if (show) {
      elements.authPanel.classList.remove('hidden');
      // 약간의 지연 후 active 클래스 추가 (애니메이션을 위해)
      setTimeout(() => {
        elements.authPanel.classList.add('active');
      }, 10);
    } else {
      elements.authPanel.classList.remove('active');
      // 애니메이션 완료 후 hidden 클래스 추가
      setTimeout(() => {
        elements.authPanel.classList.add('hidden');
      }, 300);
    }
  },

  updateUserInfo(username) {
    elements.userInfo.textContent = username ? `환영합니다, ${username}님!` : '';
    elements.userInfo.classList.toggle('hidden', !username);
    elements.toggleAuth.classList.toggle('hidden', !!username);
    elements.logoutBtn.classList.toggle('hidden', !username);
    elements.articleForm.classList.toggle('hidden', !username);
    
    // 로그인하지 않은 경우 게시글 작성 안내 메시지 표시
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert info';
    messageDiv.textContent = '게시글을 작성하려면 로그인이 필요합니다.';
    
    if (!username) {
      elements.articleForm.parentNode.insertBefore(messageDiv, elements.articleForm);
    } else {
      const existingMessage = elements.articleForm.parentNode.querySelector('.alert.info');
      if (existingMessage) {
        existingMessage.remove();
      }
    }
  },

  handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.updateUserInfo('');
    utils.displayMessage('로그아웃되었습니다.', 'success');
  }
};

// 이벤트 핸들러
const handlers = {
  async handleArticleSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      this.showMessage("게시글을 작성하려면 로그인이 필요합니다.", "error");
      this.toggleAuthPanel(true);
      return;
    }

    const formData = new FormData(event.target);
    const articleData = {
      title: formData.get("title"),
      content: formData.get("content"),
    };

    try {
      await api.createArticle(articleData);
      event.target.reset();
      this.showMessage("게시글이 성공적으로 작성되었습니다!", "success");
      this.refreshArticles();
    } catch (error) {
      this.showMessage(error.message || "게시글 작성 중 오류가 발생했습니다.", "error");
    }
  },

  async deleteArticle(articleId) {
    const token = localStorage.getItem("token");
    if (!token) {
      this.showMessage("게시글을 삭제하려면 로그인이 필요합니다.", "error");
      this.toggleAuthPanel(true);
      return;
    }

    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await api.deleteArticle(articleId);
      this.showMessage("게시글이 성공적으로 삭제되었습니다!", "success");
      this.refreshArticles();
    } catch (error) {
      this.showMessage(error.message || "게시글 삭제 중 오류가 발생했습니다.", "error");
    }
  },

  async refreshArticles() {
    try {
      const articles = await api.getArticles();
      console.log('받아온 게시글:', articles); // 디버깅용 로그 추가
      ui.displayArticles(articles);
    } catch (error) {
      console.error('게시글 목록 갱신 실패:', error);
      utils.displayMessage('게시글 목록을 불러오는데 실패했습니다.', 'error');
    }
  },

  async handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(elements.loginForm);
    const errors = utils.validateForm(formData);

    if (errors.length > 0) {
      utils.displayMessage(errors.join('\n'), 'error');
      return;
    }

    try {
      const { token } = await api.login({
        username: formData.get('username'),
        password: formData.get('password')
      });

      const userEmail = formData.get('username');
      localStorage.setItem('token', token);
      localStorage.setItem('username', userEmail);
      ui.updateUserInfo(userEmail);
      ui.toggleAuthPanel(false);
      elements.loginForm.reset();
      utils.displayMessage('로그인 성공!', 'success');
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  },

  async handleSignup(event) {
    event.preventDefault();
    const formData = new FormData(elements.signupForm);
    const errors = utils.validateForm(formData);

    if (errors.length > 0) {
      utils.displayMessage(errors.join('\n'), 'error');
      return;
    }

    try {
      await api.signup({
        username: formData.get('username'),
        password: formData.get('password')
      });

      utils.displayMessage('회원가입이 완료되었습니다. 로그인해주세요.', 'success');
      elements.signupForm.reset();
      // 회원가입 성공 후 로그인 폼으로 전환
      document.getElementById('login-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('회원가입 실패:', error);
    }
  },

  async showEditForm(id) {
    try {
      const article = await api.getArticle(id);
      elements.editForm.querySelector('#edit-title').value = article.title;
      elements.editForm.querySelector('#edit-content').value = article.content;
      elements.editForm.dataset.articleId = id;
      utils.showModal(elements.editModal);
    } catch (error) {
      console.error('게시글 정보 로드 실패:', error);
      utils.displayMessage('게시글 정보를 불러오는데 실패했습니다.', 'error');
    }
  },

  async handleEditSubmit(event) {
    event.preventDefault();
    const formData = new FormData(elements.editForm);
    const id = elements.editForm.dataset.articleId;
    const errors = utils.validateForm(formData);

    if (errors.length > 0) {
      utils.displayMessage(errors.join('\n'), 'error');
      return;
    }

    try {
      await api.updateArticle(id, {
        title: formData.get('title'),
        content: formData.get('content')
      });

      utils.displayMessage('게시글이 수정되었습니다.', 'success');
      utils.hideModal(elements.editModal);
      elements.editForm.reset();
      await this.refreshArticles();
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      utils.displayMessage(error.message || '게시글 수정에 실패했습니다.', 'error');
    }
  },

  async loadComments(articleId) {
    try {
      const comments = await api.getComments(articleId);
      const commentsList = document.getElementById(`comments-${articleId}`);
      commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
          <p class="comment-content">${comment.content}</p>
          <p class="comment-meta">
            <span class="comment-author">작성자: ${comment.author_email}</span>
            <span class="comment-date">${utils.formatDate(comment.created_at)}</span>
          </p>
        </div>
      `).join('');
    } catch (error) {
      console.error('댓글 로드 실패:', error);
    }
  },

  async handleCommentSubmit(event, articleId) {
    event.preventDefault();
    const formData = new FormData(document.getElementById(`comment-form-${articleId}`));
    const errors = utils.validateForm(formData);

    if (errors.length > 0) {
      utils.displayMessage(errors.join('\n'), 'error');
      return;
    }

    try {
      await api.createComment(articleId, {
        content: formData.get('content')
      });

      utils.displayMessage('댓글이 작성되었습니다.', 'success');
      await this.loadComments(articleId);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  }
};

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
  // 폼 제출 이벤트
  elements.articleForm.addEventListener('submit', handlers.handleArticleSubmit);
  elements.loginForm.addEventListener('submit', handlers.handleLogin);
  elements.signupForm.addEventListener('submit', handlers.handleSignup);
  elements.editForm.addEventListener('submit', handlers.handleEditSubmit);
  
  // 인증 관련 이벤트
  elements.toggleAuth.addEventListener('click', () => {
    ui.toggleAuthPanel(true);
    // 로그인 폼으로 스크롤
    document.getElementById('login-form').scrollIntoView({ behavior: 'smooth' });
  });
  
  elements.closeAuth.addEventListener('click', () => {
    ui.toggleAuthPanel(false);
    // 폼 초기화
    elements.loginForm.reset();
    elements.signupForm.reset();
  });
  
  elements.closeEdit.addEventListener('click', () => utils.hideModal(elements.editModal));

  // 로그아웃 이벤트
  elements.logoutBtn.addEventListener('click', () => ui.handleLogout());

  // 초기 게시글 목록 로드
  handlers.refreshArticles();
  
  // 로그인 상태 확인
  const token = localStorage.getItem('token');
  if (token) {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    ui.updateUserInfo(tokenPayload.email);
  }

  // 게시글 삭제 버튼 이벤트 리스너
  elements.articlesList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
      const articleId = event.target.closest('.article').dataset.id;
      handlers.deleteArticle(articleId);
    }
  });
});

