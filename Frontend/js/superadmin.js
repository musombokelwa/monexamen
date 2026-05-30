/* ============================================================
   MON EXAMEN — Super Admin Dashboard Logic
   ============================================================ */

let currentUser;
let pendingRejectDocId = null;
let pendingDeleteDocId = null;
let selectedDocIds = new Set();
let allDocsCache = [];
let allUsersCache = [];

// ── Init ──────────────────────────────────────────────────
async function initApp() {
  currentUser = await Auth.requireRole(['superadmin'], '../login.html');
  if (!currentUser) return;
  currentUser.fullname = 'Jenos Mbayo';
  await initUI();
}

async function initUI() {
  const initials = currentUser.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent   = currentUser.fullname;
  document.getElementById('welcomeTitle').innerHTML  = `Bienvenue, ${currentUser.fullname.split(' ')[0]} <i class="fas fa-hand-sparkles"></i>`;
  await refreshAll();
}

async function refreshAll() {
  allDocsCache = await API.getDocuments();
  allUsersCache = await API.getUsers();
  
  updatePendingBadge();
  renderHomeStats();
  renderPendingPreview();
  renderRecentActivity();
  renderPendingList();
  renderAllDocs();
  renderUsers();
  await renderLogs();
  renderDistributionChart();
  renderProfile();
}

// ── Page switching ────────────────────────────────────────
const PAGE_TITLES = {
  home: 'Tableau de bord',
  pending: 'Documents en attente',
  'all-docs': 'Tous les documents',
  users: 'Utilisateurs',
  logs: 'Journal d\'activité',
  profile: 'Mon profil',
};

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

// ── Pending badge ─────────────────────────────────────────
function updatePendingBadge() {
  const count = allDocsCache.filter(d => d.status === 'pending').length;
  document.getElementById('pendingBadge').textContent = count;
  document.getElementById('pendingBadge').style.display = count > 0 ? 'flex' : 'none';
}

// ── Home Stats ────────────────────────────────────────────
function renderHomeStats() {
  const docs     = allDocsCache;
  const pending  = docs.filter(d => d.status === 'pending');
  const approved = docs.filter(d => d.status === 'approved');
  const rejected = docs.filter(d => d.status === 'rejected');
  const students = allUsersCache.filter(u => u.role === 'student');

  const approvedPct = docs.length ? Math.round((approved.length / docs.length) * 100) : 0;
  const pendingPct  = docs.length ? Math.round((pending.length / docs.length) * 100) : 0;

  document.getElementById('homeStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon" style="background:var(--primary-glow);color:var(--primary)">
          <i class="fas fa-file-invoice"></i>
        </div>
        <span class="badge badge-muted">Total</span>
      </div>
      <div class="stat-card-value">${docs.length}</div>
      <div class="stat-card-label">Total documents</div>
      <div class="stat-progress"><div class="stat-progress-bar" style="width: 100%"></div></div>
    </div>
    <div class="stat-card" style="cursor:pointer" onclick="showPage('pending')">
      <div class="stat-card-top">
        <div class="stat-card-icon" style="background:rgba(255,193,7,0.1);color:#ffc107">
          <i class="fas fa-clock"></i>
        </div>
        <span class="badge badge-warning">${pendingPct}%</span>
      </div>
      <div class="stat-card-value" style="color:#ffc107">${pending.length}</div>
      <div class="stat-card-label">En attente ↗</div>
      <div class="stat-progress"><div class="stat-progress-bar" style="width: ${pendingPct}%; background: #ffc107"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon" style="background:var(--success-glow);color:var(--success)">
          <i class="fas fa-check-circle"></i>
        </div>
        <span class="badge badge-success">${approvedPct}%</span>
      </div>
      <div class="stat-card-value" style="color:var(--success)">${approved.length}</div>
      <div class="stat-card-label">Publiés</div>
      <div class="stat-progress"><div class="stat-progress-bar" style="width: ${approvedPct}%"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon" style="background:var(--danger-glow);color:var(--danger)">
          <i class="fas fa-user-graduate"></i>
        </div>
        <span class="badge badge-muted">${students.length}</span>
      </div>
      <div class="stat-card-value">${students.length}</div>
      <div class="stat-card-label">Étudiants inscrits</div>
    </div>
  `;
}

// ── Pending Preview (home) ────────────────────────────────
function renderPendingPreview() {
  const pending = allDocsCache.filter(d => d.status === 'pending').slice(-3); // already sorted desc by API
  const container = document.getElementById('pendingPreview');
  if (!pending.length) {
    container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg)">
      <div style="font-size:2rem;margin-bottom:8px"><i class="fas fa-check"></i></div>
      <div style="font-size:0.875rem;font-weight:600">Aucun document en attente</div>
    </div>`;
    return;
  }
  container.innerHTML = pending.map(d => buildPendingCard(d, true)).join('');
}

// ── Recent Activity ───────────────────────────────────────
function renderRecentActivity() {
  const docs = allDocsCache.filter(d => d.status !== 'pending').slice(0, 5);
  const tbody = document.getElementById('recentActivity');
  if (!docs.length) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:24px">Aucune activité.</td></tr>`;
    return;
  }
  tbody.innerHTML = docs.map(d => `
    <tr>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><strong>${d.title}</strong></td>
      <td>${statusBadge(d.status)}</td>
      <td style="white-space:nowrap;font-size:0.78rem">${formatDate(d.approved_at || d.added_at)}</td>
    </tr>
  `).join('');
}

// ── Distribution Chart (SVG) ──────────────────────────────
function renderDistributionChart() {
  const docs = allDocsCache;
  const types = ['examen', 'interrogation'];
  const counts = types.map(t => docs.filter(d => d.type === t).length);
  const max = Math.max(...counts, 5);
  
  const container = document.getElementById('distributionChart');
  if (!container) return;
  
  container.innerHTML = types.map((t, i) => {
    const h = (counts[i] / max) * 100;
    const color = t === 'examen' ? 'var(--primary)' : 'var(--accent)';
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;height:100%;justify-content:flex-end">
        <div style="font-size:0.75rem;font-weight:700;color:${color}">${counts[i]}</div>
        <div class="chart-bar" style="height:${h}%;width:100%;background:${color};border-radius:4px 4px 0 0;min-height:4px;transition:height 1s ease-out"></div>
        <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">${getDocTypeLabel(t)}</div>
      </div>
    `;
  }).join('');
}

// ── Pending List (full page) ──────────────────────────────
function renderPendingList() {
  const pending = allDocsCache.filter(d => d.status === 'pending');
  document.getElementById('pendingCount').textContent = `${pending.length} documents`;
  const container = document.getElementById('pendingList');
  if (!pending.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">✅</div>
      <div class="empty-state-title">Aucun document en attente</div>
      <div class="empty-state-desc">Tous les documents soumis ont été traités.</div>
    </div>`;
    return;
  }
  container.innerHTML = pending.map(d => buildPendingCard(d, false)).join('');
}

function buildPendingCard(doc, compact) {
  const submitter = allUsersCache.find(u => u.id === doc.added_by);
  const submitterName = submitter ? submitter.fullname : 'Inconnu';
  const deptLabel = doc.department_id ? getDepartmentLabel(doc.department_id) : 'Toutes sections';

  return `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;gap:12px;transition:var(--transition)" onmouseover="this.style.borderColor='var(--border-light)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div style="flex:1">
          <div style="font-size:0.9rem;font-weight:700;color:var(--text-primary);margin-bottom:6px;line-height:1.4">${doc.title}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <span class="badge ${doc.type === 'examen' ? 'badge-primary' : 'badge-accent'}">${getDocTypeLabel(doc.type)}</span>
            <span class="badge badge-muted">${getPromotionLabel(doc.promotion_id)}</span>
            <span class="badge badge-muted">${deptLabel}</span>
            <span class="badge badge-muted">${doc.year}</span>
          </div>
        </div>
        <span class="badge badge-warning"><i class="fas fa-hourglass-half"></i> En attente</span>
      </div>
      ${!compact && doc.description ? `<div style="font-size:0.82rem;color:var(--text-secondary);background:rgba(255,255,255,0.02);padding:10px 12px;border-radius:var(--radius-md);border:1px solid var(--border);line-height:1.6">${doc.description}</div>` : ''}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div style="font-size:0.78rem;color:var(--text-muted)">
          Soumis par <strong style="color:var(--text-secondary)">${submitterName}</strong> · ${formatDate(doc.added_at)}
          ${doc.file_size && doc.file_size !== '—' ? ` · ${doc.file_size}` : ''}
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <button class="btn btn-success btn-sm" onclick="approveDoc('${doc.id}')">
            <i class="fas fa-check"></i>
            Valider
          </button>
          <button class="btn btn-danger btn-sm" onclick="openRejectModal('${doc.id}')">
            <i class="fas fa-times"></i>
            Refuser
          </button>
        </div>
      </div>
    </div>
  `;
}

// ── Approve ───────────────────────────────────────────────
async function approveDoc(docId) {
  try {
    await API.updateDocumentStatus(docId, 'approved');
    showToast('success', 'Document validé !', 'Le document est maintenant publié sur la plateforme.');
    await refreshAll();
  } catch(e) {
    showToast('error', 'Erreur', 'Impossible de valider ce document.');
  }
}

// ── Reject ────────────────────────────────────────────────
function openRejectModal(docId) {
  pendingRejectDocId = docId;
  document.getElementById('rejectReason').value = '';
  document.getElementById('rejectModal').classList.remove('hidden');
  document.getElementById('confirmRejectBtn').onclick = async () => {
    try {
      await API.updateDocumentStatus(pendingRejectDocId, 'rejected');
      document.getElementById('rejectModal').classList.add('hidden');
      showToast('info', 'Document refusé', 'Le document a été refusé et retiré de la file d\'attente.');
      pendingRejectDocId = null;
      await refreshAll();
    } catch(e) {
      showToast('error', 'Erreur', 'Impossible de refuser ce document.');
    }
  };
}

// ── All Docs ──────────────────────────────────────────────
function renderAllDocs() {
  let docs = allDocsCache;
  const q      = document.getElementById('searchAllDocs')?.value.toLowerCase() || '';
  const status = document.getElementById('filterStatus')?.value || '';
  const promo  = document.getElementById('filterPromo')?.value || '';
  if (q)      docs = docs.filter(d => d.title.toLowerCase().includes(q) || (d.subject && d.subject.toLowerCase().includes(q)));
  if (status) docs = docs.filter(d => d.status === status);
  if (promo)  docs = docs.filter(d => d.promotion_id == promo);

  document.getElementById('allDocsCount').textContent = `${docs.length} documents`;
  const tbody = document.getElementById('allDocsBody');
  if (!docs.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:40px">Aucun document trouvé.</td></tr>`;
    return;
  }
  tbody.innerHTML = docs.map(d => {
    const submitter = allUsersCache.find(u => u.id === d.added_by);
    const isSelected = selectedDocIds.has(d.id);
    return `
      <tr class="${isSelected ? 'selected-row' : ''}">
        <td><input type="checkbox" class="doc-checkbox" ${isSelected ? 'checked' : ''} onchange="toggleDocSelection('${d.id}')"></td>
        <td style="max-width:200px"><strong>${d.title}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">${d.subject || ''} · ${d.year || ''}</span></td>
        <td><span class="badge ${d.type === 'examen' ? 'badge-primary' : 'badge-accent'}">${getDocTypeLabel(d.type)}</span></td>
        <td>${getPromotionLabel(d.promotion_id)}${d.department_id ? '<br><span style="font-size:0.75rem;color:var(--text-muted)">' + getDepartmentLabel(d.department_id) + '</span>' : ''}</td>
        <td>${statusBadge(d.status)}</td>
        <td style="font-size:0.8rem">${submitter ? submitter.fullname : '—'}</td>
        <td style="white-space:nowrap;font-size:0.78rem">${formatDate(d.added_at)}</td>
        <td>
          <div style="display:flex;gap:6px">
            ${d.status === 'pending' ? `
              <button class="btn btn-success btn-sm" onclick="approveDoc('${d.id}')"><i class="fas fa-check"></i></button>
              <button class="btn btn-danger btn-sm" onclick="openRejectModal('${d.id}')"><i class="fas fa-times"></i></button>
            ` : `
              <button class="btn btn-danger btn-sm" onclick="confirmDeleteDoc('${d.id}')"><i class="fas fa-trash"></i></button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
  updateBulkBar();
}

// ── Bulk Logic ────────────────────────────────────────────
function toggleDocSelection(id) {
  if (selectedDocIds.has(id)) selectedDocIds.delete(id);
  else selectedDocIds.add(id);
  renderAllDocs();
}

function toggleSelectAll() {
  const allChecked = document.getElementById('selectAllDocs').checked;
  if (allChecked) {
    allDocsCache.forEach(d => selectedDocIds.add(d.id));
  } else {
    selectedDocIds.clear();
  }
  renderAllDocs();
}

function updateBulkBar() {
  const bar = document.getElementById('bulkActionsBar');
  const countLabel = document.getElementById('selectedCount');
  if (selectedDocIds.size > 0) {
    bar.classList.remove('hidden');
    countLabel.textContent = `${selectedDocIds.size} sélectionné${selectedDocIds.size > 1 ? 's' : ''}`;
  } else {
    bar.classList.add('hidden');
    const selectAll = document.getElementById('selectAllDocs');
    if (selectAll) selectAll.checked = false;
  }
}

function clearSelection() {
  selectedDocIds.clear();
  renderAllDocs();
}

async function bulkApprove() {
  if (!confirm(`Voulez-vous approuver les ${selectedDocIds.size} documents sélectionnés ?`)) return;
  for (let id of selectedDocIds) {
    const doc = allDocsCache.find(d => d.id === id);
    if (doc && doc.status === 'pending') {
      await API.updateDocumentStatus(id, 'approved');
    }
  }
  showToast('success', 'Documents validés', `${selectedDocIds.size} documents ont été approuvés.`);
  selectedDocIds.clear();
  await refreshAll();
}

async function bulkDelete() {
  if (!confirm(`Voulez-vous supprimer définitivement les ${selectedDocIds.size} documents sélectionnés ?`)) return;
  for (let id of selectedDocIds) {
    await API.deleteDocument(id);
  }
  showToast('success', 'Documents supprimés', `${selectedDocIds.size} documents ont été supprimés.`);
  selectedDocIds.clear();
  await refreshAll();
}

// ── Delete doc ────────────────────────────────────────────
function confirmDeleteDoc(docId) {
  pendingDeleteDocId = docId;
  document.getElementById('deleteModal').classList.remove('hidden');
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
      await API.deleteDocument(pendingDeleteDocId);
      document.getElementById('deleteModal').classList.add('hidden');
      showToast('success', 'Document supprimé', 'Le document a été supprimé définitivement.');
      pendingDeleteDocId = null;
      await refreshAll();
    } catch(e) {
      showToast('error', 'Erreur', 'Impossible de supprimer ce document.');
    }
  };
}

// ── Users ─────────────────────────────────────────────────
function renderUsers() {
  let users = allUsersCache;
  const q    = document.getElementById('searchUsers')?.value.toLowerCase() || '';
  const role = document.getElementById('filterRole')?.value || '';
  if (q)    users = users.filter(u => u.fullname.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  if (role) users = users.filter(u => u.role === role);

  document.getElementById('usersCount').textContent = `${users.length} utilisateurs`;
  const tbody = document.getElementById('usersBody');
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px">Aucun utilisateur trouvé.</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:#000;flex-shrink:0">
            ${u.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <strong>${u.fullname}</strong>
        </div>
      </td>
      <td style="font-size:0.82rem">${u.email}</td>
      <td>${roleBadge(u.role)}</td>
      <td style="font-size:0.82rem">${u.promotion_id ? getPromotionLabel(u.promotion_id) : '—'}</td>
      <td style="font-size:0.78rem;white-space:nowrap">${formatDate(u.created_at)}</td>
      <td>
        ${u.id !== currentUser.id
          ? `<div style="display:flex;gap:6px">
               <button class="btn btn-outline btn-sm" onclick="openEditUserModal('${u.id}')"><i class="fas fa-edit"></i> Modifier</button>
               <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}')">Supprimer</button>
             </div>`
          : '<span style="color:var(--text-muted);font-size:0.8rem">Vous</span>'}
      </td>
    </tr>
  `).join('');
}

async function deleteUser(userId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
  try {
    await API.deleteUser(userId);
    showToast('success', 'Utilisateur supprimé', '');
    await refreshAll();
  } catch(e) {
    showToast('error', 'Erreur', 'Impossible de supprimer l\'utilisateur.');
  }
}

// ── Admin Management ────────────────────────────────────
function openAddAdminModal() {
  document.getElementById('addAdminForm').reset();
  document.getElementById('addAdminModal').classList.remove('hidden');
}

async function handleAddAdmin(e) {
  e.preventDefault();
  const fullname = document.getElementById('adminName').value.trim();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPass').value;

  try {
    await API.createAdmin({ fullname, email, password });
    document.getElementById('addAdminModal').classList.add('hidden');
    showToast('success', 'Succès', `L'administrateur ${fullname} a été créé.`);
    await refreshAll();
  } catch(err) {
    showToast('error', 'Erreur', 'Impossible de créer cet administrateur (email peut-être déjà utilisé).');
  }
}

function openEditUserModal(userId) {
  const user = allUsersCache.find(u => u.id == userId);
  if (!user) return;
  document.getElementById('editUserId').value = user.id;
  document.getElementById('editUserName').value = user.fullname;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserPass').value = '';
  document.getElementById('editUserModal').classList.remove('hidden');
}

async function handleEditUser(e) {
  e.preventDefault();
  const id = document.getElementById('editUserId').value;
  const fullname = document.getElementById('editUserName').value.trim();
  const email = document.getElementById('editUserEmail').value.trim();
  const password = document.getElementById('editUserPass').value;

  const updates = { fullname, email };
  if (password) {
    updates.password = password;
  }

  try {
    await API.updateUser(id, updates);
    document.getElementById('editUserModal').classList.add('hidden');
    showToast('success', 'Succès', `L'utilisateur ${fullname} a été mis à jour.`);
    await refreshAll();
  } catch(err) {
    showToast('error', 'Erreur', 'Impossible de modifier l\'utilisateur.');
  }
}

// ── Badges ────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    pending:  '<span class="badge badge-warning"><i class="fas fa-hourglass-half"></i> En attente</span>',
    approved: '<span class="badge badge-success"><i class="fas fa-check"></i> Publié</span>',
    rejected: '<span class="badge badge-danger"><i class="fas fa-times"></i> Refusé</span>',
  };
  return map[status] || status;
}

function roleBadge(role) {
  const map = {
    student:    '<span class="badge badge-success">Étudiant</span>',
    admin:      '<span class="badge badge-primary">Administrateur</span>',
    superadmin: '<span class="badge badge-accent">Super Admin</span>',
  };
  return map[role] || role;
}

// ── Logs ──────────────────────────────────────────────────
async function renderLogs() {
  const logs = await API.getLogs();
  const tbody = document.getElementById('logsBody');
  if (!logs.length) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:40px">Aucun log disponible.</td></tr>`;
    return;
  }
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td><span style="font-weight:600">${l.action}</span></td>
      <td>${l.user}</td>
      <td style="font-size:0.78rem;white-space:nowrap">${formatDate(l.date)}</td>
    </tr>
  `).join('');
}

async function clearLogs() {
  if (!confirm('Voulez-vous vraiment effacer tout le journal d\'activité ?')) return;
  try {
    await API._fetch('/superadmin/clear-logs', { method: 'DELETE' }); // direct call
    await refreshAll();
  } catch(e) {
    showToast('error', 'Erreur', 'Impossible d\'effacer les logs.');
  }
}

// ── Profile ───────────────────────────────────────────────
function renderProfile() {
  const initials = currentUser.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('profileCard').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
      <div style="width:64px;height:64px;border-radius:16px;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;color:#000">${initials}</div>
      <div>
        <div style="font-size:1.2rem;font-weight:800;font-family:var(--font-heading)">${currentUser.fullname}</div>
        <span class="badge badge-accent" style="margin-top:6px">Super Administrateur</span>
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
        <div style="font-size:0.9rem;color:var(--text-primary);padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">Super Administrateur</div>
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
