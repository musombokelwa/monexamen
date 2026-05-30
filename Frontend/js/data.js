/* ============================================================
   MON EXAMEN — API Data Store (Fetch to Flask Backend)
   ============================================================ */

// URL dynamique de l'API: détecte si on tourne en local (Live Server / Fichier direct) ou sous Docker (Nginx)
const API_BASE_URL = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '80' && window.location.port !== '8080' && window.location.port !== '443'))
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

const PROMOTIONS = [
  { id: 1, label: 'Préparatoire', departments: null },
  { id: 2, label: 'Bac 1',        departments: [1, 2, 3, 4] },
  { id: 3, label: 'Bac 2',        departments: [1, 2, 3, 4] },
  { id: 4, label: 'Bac 3',        departments: [1, 2, 3, 4] },
  { id: 5, label: 'Master 1',     departments: [1, 2, 3, 4] },
  { id: 6, label: 'Master 2',     departments: [1, 2, 3, 4] },
];

const DEPARTMENTS = {
  1: 'Génie Informatique',
  2: 'Génie Électrique',
  3: 'Génie Civil',
  4: 'Génie des Procédés',
};

const DOC_TYPES = {
  examen:         'Examen',
  interrogation:  'Interrogation',
};

const STATUS = {
  pending:  'En attente',
  approved: 'Publié',
  rejected: 'Refusé',
};

/* ── Session & Auth ────────────────────────────────────────── */
const SESSION_KEY = 'monexamen_session';

const Auth = {
  getToken() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s).token : null;
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.message || 'Erreur de connexion.' };
      }
      
      if (!data.user.approved) {
        return { success: false, error: 'Votre compte est en attente de validation.' };
      }
      
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        token: data.token,
        userId: data.user.id,
        role: data.user.role,
        user: data.user
      }));
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, error: 'Erreur réseau.' };
    }
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    const isInsideFolder = window.location.pathname.includes('/admin/') || 
                           window.location.pathname.includes('/superadmin/') || 
                           window.location.pathname.includes('/student/');
    window.location.href = isInsideFolder ? '../login.html' : 'login.html';
  },

  getSession() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  },

  getCurrentUser() {
    const s = this.getSession();
    return s ? s.user : null;
  },

  async requireRole(roles, redirectTo = '../login.html') {
    const user = this.getCurrentUser();
    if (!user || !roles.includes(user.role)) {
      window.location.href = redirectTo;
      return null;
    }
    // Optionally verify with backend `/api/me`
    try {
      const res = await fetch(`${API_BASE_URL}/me`, {
        headers: { 'Authorization': `Bearer ${this.getToken()}` }
      });
      if (!res.ok) throw new Error();
      return user;
    } catch (e) {
      this.logout();
      return null;
    }
  },

  async requireAuth(redirectTo = '../login.html') {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  },
};

/* ── API Calls ───────────────────────────────────────────── */
const API = {
  async _fetch(endpoint, options = {}) {
    const token = Auth.getToken();
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Automatically set Content-Type to application/json if body is stringified JSON
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      return data;
    } catch (e) {
      console.error(`API Error on ${endpoint}:`, e);
      throw e;
    }
  },

  /* ── Users ── */
  async getUsers() {
    const data = await this._fetch('/superadmin/users');
    return data.users || [];
  },
  
  async createAdmin(data) {
    return await this._fetch('/superadmin/create-admin', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateUser(id, updates) {
    return await this._fetch(`/superadmin/update-user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteUser(id) {
    return await this._fetch(`/superadmin/delete-admin/${id}`, {
      method: 'DELETE'
    });
  },

  /* ── Documents ── */
  async getDocuments() {
    // Determine route based on role
    const user = Auth.getCurrentUser();
    if (!user) return [];
    
    let endpoint = '/documents'; // public/general ? No, backend says /documents but admin/student have specific
    if (user.role === 'student') {
      endpoint = '/student/documents';
    } else if (user.role === 'admin') {
      endpoint = '/admin/documents';
    } else if (user.role === 'superadmin') {
      // Superadmin can use admin endpoint to get all docs
      endpoint = '/admin/documents';
    }

    const data = await this._fetch(endpoint);
    return data.documents || [];
  },

  async getDocumentsForPromotion(promotionId) {
    // In our backend, /api/student/documents returns approved documents for the student's promotion
    // If we need specifically by promotion for public, we might need a public route, 
    // but right now students just see their own.
    // For now, fetch all and filter client-side if we use the general route
    const docs = await this.getDocuments();
    return docs.filter(d => d.promotion_id == promotionId && d.status === 'approved');
  },

  async createDocument(formData) {
    // Using formData for file upload
    const token = Auth.getToken();
    const res = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData // DO NOT set Content-Type, browser will set it with boundary
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error uploading document');
    return data;
  },

  async updateDocumentStatus(id, status) {
    return await this._fetch('/admin/approve-document', {
      method: 'POST',
      body: JSON.stringify({ document_id: id, status })
    });
  },

  async deleteDocument(id) {
    const user = Auth.getCurrentUser();
    let endpoint = `/documents/${id}`; // default
    if (user && user.role === 'admin') {
       endpoint = `/admin/document/${id}`;
    }
    return await this._fetch(endpoint, { method: 'DELETE' });
  },

  /* ── Logs & Stats ── */
  async getLogs() {
    const data = await this._fetch('/superadmin/logs');
    return data.logs || [];
  },

  async getStatistics() {
    const data = await this._fetch('/superadmin/statistics');
    return data.statistics || {};
  }
};


/* ── Toast helper ────────────────────────────────────────── */
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '<i class="fas fa-check-circle"></i>',
    error:   '<i class="fas fa-times-circle"></i>',
    info:    '<i class="fas fa-info-circle"></i>',
    warning: '<i class="fas fa-exclamation-triangle"></i>',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || '<i class="fas fa-info-circle"></i>'}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Format helpers ──────────────────────────────────────── */
function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getPromotionLabel(id) {
  const p = PROMOTIONS.find(p => p.id == id); // == to handle string vs int
  return p ? p.label : id;
}

function getDepartmentLabel(id) {
  return DEPARTMENTS[id] || id;
}

function getDocTypeLabel(id) {
  return DOC_TYPES[id] || id;
}

function getStatusLabel(id) {
  return STATUS[id] || id;
}

/* ── Global UI Components ────────────────────────────────── */
const UI = {
  renderFooter() {
    if (document.querySelector('.global-footer')) return;
    const footer = document.createElement('footer');
    footer.className = 'global-footer';
    footer.innerHTML = `
      <div class="footer-container">
        <p class="footer-text">© 2026 — Site développé par l’équipe <span class="footer-team">Codeur X</span>.</p>
      </div>
    `;
    const dashMain = document.querySelector('.dash-main');
    const authWrapper = document.querySelector('.auth-right');
    const contentTarget = dashMain || authWrapper || document.body;
    contentTarget.appendChild(footer);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UI.renderFooter());
} else {
  UI.renderFooter();
}
