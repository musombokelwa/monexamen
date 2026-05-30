/* ============================================================
   MON EXAMEN — Student Site Logic & Utilities
   ============================================================ */

/**
 * Build the HTML for a document card.
 * Shared across Home, Documents, and Departments pages.
 */
function buildDocCard(doc) {
  const isExamen = doc.type === 'examen';
  const deptLabel = doc.department_id ? getDepartmentLabel(doc.department_id) : 'Tronc Commun';
  
  return `
    <div class="doc-card anim-fade-up">
      <div class="doc-header">
        <div class="doc-type-icon ${isExamen ? 'type-examen' : 'type-interro'}">
          ${isExamen 
            ? '<i class="fas fa-file-alt"></i>'
            : '<i class="fas fa-pen-to-square"></i>'}
        </div>
        <span class="badge ${isExamen ? 'badge-primary' : 'badge-accent'}">${getDocTypeLabel(doc.type)}</span>
      </div>
      <div class="doc-title">${doc.title}</div>
      <div class="doc-meta">
        <span class="badge badge-muted">${doc.subject}</span>
        <span class="badge badge-muted">${deptLabel}</span>
        <span class="badge badge-muted">${doc.year}</span>
      </div>
      <div class="doc-footer">
        <button class="btn btn-outline btn-sm flex-1" onclick="openDocModal('${doc.id}')">
          Détails
        </button>
        <button class="btn btn-primary btn-sm flex-1" onclick="downloadDoc('${doc.id}')">
          <i class="fas fa-download"></i>
          PDF
        </button>
      </div>
    </div>
  `;
}

/**
 * Open the document details modal.
 */
function openDocModal(docId) {
  const doc = (window._loadedDocs || []).find(d => d.id == docId);
  if (!doc) return;
  
  const isExamen = doc.type === 'examen';
  const deptLabel = doc.department_id ? getDepartmentLabel(doc.department_id) : 'Toutes sections';
  const modal = document.getElementById('docModal');
  const content = document.getElementById('docModalContent');

  content.innerHTML = `
    <button class="modal-close" onclick="closeDocModal()"><i class="fas fa-times"></i></button>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <div class="doc-type-icon ${isExamen ? 'type-examen' : 'type-interro'}" style="width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center">
        ${isExamen
          ? '<i class="fas fa-file-alt" style="font-size:1.5rem"></i>'
          : '<i class="fas fa-pen-to-square" style="font-size:1.5rem"></i>'}
      </div>
      <div>
        <div style="font-size:1.2rem;font-weight:800;font-family:var(--font-heading);margin-bottom:4px;color:var(--text-primary)">${doc.title}</div>
        <span class="badge ${isExamen ? 'badge-primary' : 'badge-accent'}">${getDocTypeLabel(doc.type)}</span>
      </div>
    </div>
    <div class="divider"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0">
      <div><div class="form-label">Matière</div><div style="font-size:0.95rem;color:var(--text-primary);margin-top:4px">${doc.subject}</div></div>
      <div><div class="form-label">Département</div><div style="font-size:0.95rem;color:var(--text-primary);margin-top:4px">${deptLabel}</div></div>
      <div><div class="form-label">Promotion</div><div style="font-size:0.95rem;color:var(--text-primary);margin-top:4px">${getPromotionLabel(doc.promotion_id)}</div></div>
      <div><div class="form-label">Année Académique</div><div style="font-size:0.95rem;color:var(--text-primary);margin-top:4px">${doc.year}</div></div>
      <div><div class="form-label">Session</div><div style="font-size:0.95rem;color:var(--text-primary);margin-top:4px">${doc.session || 'N/A'}</div></div>
      <div><div class="form-label">Taille du fichier</div><div style="font-size:0.95rem;color:var(--text-primary);margin-top:4px">${doc.file_size}</div></div>
    </div>
    ${doc.description ? `<div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:16px;margin:16px 0;font-size:0.9rem;color:var(--text-secondary);line-height:1.6">${doc.description}</div>` : ''}
    <div class="divider"></div>
    <button class="btn btn-primary w-full btn-lg" onclick="downloadDoc('${doc.id}')" style="margin-top:10px">
      <i class="fas fa-download"></i>
      Télécharger le document PDF
    </button>
  `;
  modal.classList.remove('hidden');
}

function closeDocModal() {
  document.getElementById('docModal').classList.add('hidden');
}

function closeModal(e) {
  if (e.target.id === 'docModal') closeDocModal();
}

/**
 * Simulate document download.
 */
function downloadDoc(docId) {
  const doc = (window._loadedDocs || []).find(d => d.id == docId);
  if (!doc) return;
  showToast('info', 'Téléchargement', `Préparation de ${doc.file_name || 'document'}...`);
  setTimeout(() => {
    showToast('success', 'Terminé', `Le document a été téléchargé avec succès.`);
  }, 1200);
}

/**
 * Mobile Navbar Toggle
 */
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
}

/**
 * Centralized Navbar State Management
 */
function updateNavbar() {
  const user = Auth.getCurrentUser();
  const navActions = document.getElementById('navActions');
  const mobileActions = document.getElementById('mobileActions');
  
  if (!navActions) return;

  if (user && user.role === 'student') {
    const firstName = user.fullname ? user.fullname.split(' ')[0] : 'Étudiant';
    const promoLabel = user.promotion_id ? getPromotionLabel(user.promotion_id) : 'Aucune';
    
    const userHtml = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="user-info text-right hidden-mobile" style="margin-right:10px; text-align: right;">
          <div style="font-size:0.85rem;font-weight:700;color:var(--text-primary);line-height:1.2;">${firstName}</div>
          <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;">${promoLabel}</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="Auth.logout()">Déconnexion</button>
      </div>
    `;
    navActions.innerHTML = userHtml;
    
    if (mobileActions) {
      mobileActions.innerHTML = `
        <button class="btn btn-outline w-full" onclick="Auth.logout()">Déconnexion</button>
      `;
    }
  } else {
    // Determine if on index.html
    const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    
    if (isIndex) {
      navActions.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">Se connecter</a>
        <a href="login.html#register" class="btn btn-primary btn-sm">Créer un compte</a>
      `;
      if (mobileActions) {
        mobileActions.innerHTML = `
          <a href="login.html" class="btn btn-outline w-full">Se connecter</a>
          <a href="login.html#register" class="btn btn-primary w-full" style="margin-top:10px;">Créer un compte</a>
        `;
      }
    } else {
      navActions.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">Se connecter</a>
      `;
      if (mobileActions) {
        mobileActions.innerHTML = `
          <a href="login.html" class="btn btn-outline w-full">Se connecter</a>
        `;
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateNavbar);
} else {
  updateNavbar();
}

