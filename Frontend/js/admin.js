/* ============================================================
   MON EXAMEN — Admin Dashboard Logic
   ============================================================ */

let currentUser;
let pendingDelete = null;

// ── Init ──────────────────────────────────────────────────
async function initApp() {
  currentUser = await Auth.requireRole(['admin'], '../login.html');
  if (!currentUser) return;
  await initUI();
}

async function initUI() {
  const initials = currentUser.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent   = currentUser.fullname;
  document.getElementById('welcomeTitle').innerHTML  = `Bienvenue, ${currentUser.fullname.split(' ')[0]} <i class="fas fa-hand-sparkles"></i>`;
  await renderHomeStats();
  await renderRecentTable();
  await renderMyDocs();
  renderProfile();
}

// ── Page switching ────────────────────────────────────────
const PAGE_TITLES = { home: 'Tableau de bord', add: 'Ajouter un document', 'my-docs': 'Mes documents', profile: 'Mon profil' };

function showPage(id) {
  document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  document.getElementById('topbarTitle').textContent = PAGE_TITLES[id] || id;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const nav = document.getElementById(`nav-${id}`);
  if (nav) nav.classList.add('active');
  closeSidebar();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
}

// ── My docs ───────────────────────────────────────────────
async function getMyDocs() {
  const allDocs = await API.getDocuments();
  return allDocs.filter(d => d.added_by === currentUser.id);
}

// ── Home Stats ────────────────────────────────────────────
async function renderHomeStats() {
  const all      = await getMyDocs();
  const pending  = all.filter(d => d.status === 'pending');
  const approved = all.filter(d => d.status === 'approved');
  const rejected = all.filter(d => d.status === 'rejected');

  document.getElementById('homeStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon" style="background:var(--primary-glow);color:var(--primary)">
          <i class="fas fa-file-invoice"></i>
        </div>
      </div>
      <div class="stat-card-value">${all.length}</div>
      <div class="stat-card-label">Total soumis</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon" style="background:var(--warning-glow);color:var(--warning)">
          <i class="fas fa-clock"></i>
        </div>
      </div>
      <div class="stat-card-value">${pending.length}</div>
      <div class="stat-card-label">En attente</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon" style="background:var(--success-glow);color:var(--success)">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>
      <div class="stat-card-value">${approved.length}</div>
      <div class="stat-card-label">Publiés</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon" style="background:var(--danger-glow);color:var(--danger)">
          <i class="fas fa-times-circle"></i>
        </div>
      </div>
      <div class="stat-card-value">${rejected.length}</div>
      <div class="stat-card-label">Refusés</div>
    </div>
  `;
}

// ── Recent table ──────────────────────────────────────────
async function renderRecentTable() {
  const allDocs = await getMyDocs();
  const docs = allDocs.slice(0, 5); // Assuming already sorted descending by backend
  const tbody = document.getElementById('recentTableBody');
  if (!docs.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">Aucun document soumis pour le moment.</td></tr>`;
    return;
  }
  tbody.innerHTML = docs.map(d => `
    <tr>
      <td><strong>${d.title}</strong></td>
      <td><span class="badge ${d.type === 'examen' ? 'badge-primary' : 'badge-accent'}">${getDocTypeLabel(d.type)}</span></td>
      <td>${getPromotionLabel(d.promotion_id)}${d.department_id ? ' / ' + getDepartmentLabel(d.department_id) : ''}</td>
      <td>${statusBadge(d.status)}</td>
      <td>${formatDate(d.added_at)}</td>
    </tr>
  `).join('');
}

// ── My Docs table ─────────────────────────────────────────
async function renderMyDocs() {
  let docs = await getMyDocs();
  const q      = document.getElementById('searchMyDocs')?.value.toLowerCase() || '';
  const status = document.getElementById('filterMyStatus')?.value || '';
  if (q)      docs = docs.filter(d => d.title.toLowerCase().includes(q) || d.subject.toLowerCase().includes(q));
  if (status) docs = docs.filter(d => d.status === status);

  document.getElementById('myDocsCount').textContent = `${docs.length} documents`;
  const tbody = document.getElementById('myDocsTableBody');
  if (!docs.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px">Aucun document trouvé.</td></tr>`;
    return;
  }
  tbody.innerHTML = docs.map(d => `
    <tr>
      <td style="max-width:220px"><strong>${d.title}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">${d.subject} · ${d.year}</span></td>
      <td><span class="badge ${d.type === 'examen' ? 'badge-primary' : 'badge-accent'}">${getDocTypeLabel(d.type)}</span></td>
      <td>${getPromotionLabel(d.promotion_id)}${d.department_id ? '<br><span style="font-size:0.75rem;color:var(--text-muted)">' + getDepartmentLabel(d.department_id) + '</span>' : ''}</td>
      <td>${statusBadge(d.status)}</td>
      <td style="white-space:nowrap">${formatDate(d.added_at)}</td>
      <td>
        ${d.status === 'pending' ? `<button class="btn btn-danger btn-sm" onclick="confirmDelete('${d.id}')">Supprimer</button>` : '<span style="color:var(--text-muted);font-size:0.8rem">—</span>'}
      </td>
    </tr>
  `).join('');
}

// ── Status badge ──────────────────────────────────────────
function statusBadge(status) {
  const map = {
    pending:  '<span class="badge badge-warning"><i class="fas fa-hourglass-half"></i> En attente</span>',
    approved: '<span class="badge badge-success"><i class="fas fa-check"></i> Publié</span>',
    rejected: '<span class="badge badge-danger"><i class="fas fa-times"></i> Refusé</span>',
  };
  return map[status] || status;
}

// ── Add document ──────────────────────────────────────────
function handleDocPromoChange() {
  const promo = document.getElementById('docPromotion').value;
  const deptGroup  = document.getElementById('docDeptGroup');
  const deptSelect = document.getElementById('docDepartment');
  if (promo && promo !== 'preparatoire') {
    deptGroup.style.display = 'block';
    deptSelect.required = true;
  } else {
    deptGroup.style.display = 'none';
    deptSelect.required = false;
    deptSelect.value = '';
  }
}

let selectedFile = null;

function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  selectedFile = file;
  const fn = document.getElementById('uploadFileName');
  fn.innerHTML = `<i class="fas fa-check"></i> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  fn.classList.remove('hidden');
  document.getElementById('uploadZone').style.borderColor = 'var(--success)';
}

async function handleAddDoc(e) {
  e.preventDefault();
  const title      = document.getElementById('docTitle').value.trim();
  const type       = document.getElementById('docType').value;
  const promotion  = document.getElementById('docPromotion').value;
  const department = document.getElementById('docDepartment').value;
  const subject    = document.getElementById('docSubject').value.trim();
  const year       = document.getElementById('docYear').value;
  const session    = document.getElementById('docSession').value.trim();
  const desc       = document.getElementById('docDesc').value.trim();

  if (promotion !== 'preparatoire' && !department) {
    showToast('error', 'Erreur', 'Veuillez sélectionner un département.'); return;
  }

  const btn = document.getElementById('submitDocBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Soumission...';

  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('promotion_id', promotion);
    if (promotion !== 'preparatoire' && department) formData.append('department_id', department);
    formData.append('subject', subject);
    formData.append('year', year);
    formData.append('session', session);
    formData.append('description', desc);
    if (selectedFile) formData.append('file', selectedFile);

    await API.createDocument(formData);

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Soumettre pour validation';
    showToast('success', 'Document soumis !', 'Le document est en attente de validation.');
    resetForm();
    await renderHomeStats();
    await renderRecentTable();
    await renderMyDocs();
    showPage('my-docs');
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Soumettre pour validation';
    showToast('error', 'Erreur', 'Impossible de soumettre le document.');
  }
}

function resetForm() {
  document.getElementById('addDocForm').reset();
  document.getElementById('docDeptGroup').style.display = 'none';
  document.getElementById('uploadFileName').classList.add('hidden');
  document.getElementById('uploadZone').style.borderColor = '';
  selectedFile = null;
}

// ── Delete ────────────────────────────────────────────────
function confirmDelete(docId) {
  pendingDelete = docId;
  document.getElementById('deleteModal').classList.remove('hidden');
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
      await API.deleteDocument(pendingDelete);
      document.getElementById('deleteModal').classList.add('hidden');
      showToast('success', 'Supprimé', 'Le document a été supprimé.');
      await renderHomeStats();
      await renderRecentTable();
      await renderMyDocs();
      pendingDelete = null;
    } catch (err) {
      showToast('error', 'Erreur', 'Impossible de supprimer le document.');
    }
  };
}

// ── Profile ───────────────────────────────────────────────
function renderProfile() {
  const initials = currentUser.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('profileCard').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
      <div style="width:64px;height:64px;border-radius:16px;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;color:#000">${initials}</div>
      <div>
        <div style="font-size:1.2rem;font-weight:800;font-family:var(--font-heading)">${currentUser.fullname}</div>
        <span class="badge badge-primary" style="margin-top:6px">Administrateur</span>
      </div>
    </div>
    <div class="divider"></div>
    <div style="display:flex;flex-direction:column;gap:14px;margin-top:16px">
      <div class="form-group">
        <label class="form-label">Email</label>
        <div style="font-size:0.9rem;color:var(--text-primary);padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">${currentUser.email}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Rôle</label>
        <div style="font-size:0.9rem;color:var(--text-primary);padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">Administrateur</div>
      </div>
      <div class="form-group">
        <label class="form-label">Membre depuis</label>
        <div style="font-size:0.9rem;color:var(--text-primary);padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">${formatDate(currentUser.created_at)}</div>
      </div>
    </div>
    <div class="divider" style="margin-top:20px"></div>
    <button class="btn btn-danger btn-sm" onclick="Auth.logout()">
      <i class="fas fa-sign-out-alt"></i>
      Se déconnecter
    </button>
  `;
}

initApp();
