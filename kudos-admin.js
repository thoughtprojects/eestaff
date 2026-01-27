/* =========================================================
   kudos-admin.js
   Admin interface for managing kudos
   ========================================================= */

let kudosData = [];

// Load kudos data
async function loadKudos() {
  try {
    const response = await fetch('./kudos.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load kudos');
    const data = await response.json();
    kudosData = data.kudos || [];
    
    // Also load pending kudos from localStorage (for demo purposes)
    const pending = JSON.parse(localStorage.getItem('pendingKudos') || '[]');
    kudosData = [...pending, ...kudosData];
    
    renderStats();
    renderTabs();
  } catch (error) {
    console.error('Error loading kudos:', error);
    kudosData = [];
    renderStats();
    renderTabs();
  }
}

// Calculate stats
function renderStats() {
  const pending = kudosData.filter(k => k.status === 'pending').length;
  const approved = kudosData.filter(k => k.status === 'approved').length;
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = kudosData.filter(k => new Date(k.date) > weekAgo).length;
  
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statApproved').textContent = approved;
  document.getElementById('statThisWeek').textContent = thisWeek;
}

// Render kudos list
function renderKudosList(kudosList, containerId) {
  const container = document.getElementById(containerId);
  
  if (kudosList.length === 0) {
    container.innerHTML = '<div class="empty-state">No kudos to display</div>';
    return;
  }
  
  container.innerHTML = kudosList.map(kudos => {
    const date = new Date(kudos.date);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const isPending = kudos.status === 'pending';
    const isPinned = kudos.pinned;
    
    return `
      <div class="kudos-item ${isPending ? 'pending' : ''} ${isPinned ? 'pinned' : ''}" data-id="${kudos.id}">
        <div class="kudos-header">
          <div class="kudos-meta">
            <div class="kudos-from-to">
              <strong>${kudos.from}</strong> → <strong>${kudos.to}</strong>
            </div>
            <div>
              <span class="kudos-category">${kudos.category}</span>
              <span class="kudos-date">${dateStr}</span>
              ${isPinned ? '<span class="kudos-category" style="background: rgba(255,215,0,.2); color: #ffd700;">📌 Pinned</span>' : ''}
            </div>
          </div>
        </div>
        
        <div class="kudos-message">${kudos.message}</div>
        
        <div class="kudos-actions">
          ${isPending ? `
            <button class="action-btn approve" onclick="approveKudos('${kudos.id}')">✓ Approve</button>
            <button class="action-btn reject" onclick="rejectKudos('${kudos.id}')">✗ Reject</button>
          ` : ''}
          <button class="action-btn" onclick="openEditModal('${kudos.id}')">✎ Edit</button>
          <button class="action-btn ${isPinned ? '' : 'pin'}" onclick="togglePin('${kudos.id}')">
            ${isPinned ? '📌 Unpin' : '📌 Pin'}
          </button>
          <button class="action-btn delete" onclick="deleteKudos('${kudos.id}')">🗑 Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// Render all tabs
function renderTabs() {
  const pending = kudosData.filter(k => k.status === 'pending');
  const approved = kudosData.filter(k => k.status === 'approved');
  
  renderKudosList(pending, 'pendingList');
  renderKudosList(approved, 'approvedList');
  renderKudosList(kudosData, 'allList');
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active to clicked tab
    this.classList.add('active');
    const tabName = this.dataset.tab;
    document.getElementById(tabName + 'Tab').classList.add('active');
  });
});

// Approve kudos
window.approveKudos = function(id) {
  const kudos = kudosData.find(k => k.id === id);
  if (!kudos) return;
  
  kudos.status = 'approved';
  saveAndRefresh();
  alert('Kudos approved! It will now appear on the homepage.');
};

// Reject kudos
window.rejectKudos = function(id) {
  if (!confirm('Are you sure you want to reject this kudos? It will be permanently deleted.')) {
    return;
  }
  
  kudosData = kudosData.filter(k => k.id !== id);
  saveAndRefresh();
};

// Delete kudos
window.deleteKudos = function(id) {
  if (!confirm('Are you sure you want to delete this kudos?')) {
    return;
  }
  
  kudosData = kudosData.filter(k => k.id !== id);
  saveAndRefresh();
};

// Toggle pin
window.togglePin = function(id) {
  const kudos = kudosData.find(k => k.id === id);
  if (!kudos) return;
  
  kudos.pinned = !kudos.pinned;
  saveAndRefresh();
};

// Edit modal
let editingId = null;

window.openEditModal = function(id) {
  const kudos = kudosData.find(k => k.id === id);
  if (!kudos) return;
  
  editingId = id;
  document.getElementById('editId').value = id;
  document.getElementById('editFrom').value = kudos.from;
  document.getElementById('editTo').value = kudos.to;
  document.getElementById('editMessage').value = kudos.message;
  
  document.getElementById('editModal').classList.add('show');
};

window.closeEditModal = function() {
  document.getElementById('editModal').classList.remove('show');
  editingId = null;
};

document.getElementById('editForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const kudos = kudosData.find(k => k.id === editingId);
  if (!kudos) return;
  
  kudos.from = document.getElementById('editFrom').value;
  kudos.to = document.getElementById('editTo').value;
  kudos.message = document.getElementById('editMessage').value;
  
  saveAndRefresh();
  closeEditModal();
  alert('Kudos updated successfully!');
});

// Save and refresh
function saveAndRefresh() {
  // In a real implementation, this would POST to your backend
  // For demo purposes, we'll update localStorage
  const pending = kudosData.filter(k => k.status === 'pending');
  const approved = kudosData.filter(k => k.status === 'approved');
  
  localStorage.setItem('pendingKudos', JSON.stringify(pending));
  
  // In production, you'd save approved kudos to kudos.json via API
  console.log('Approved kudos to save:', approved);
  
  renderStats();
  renderTabs();
}

// Initialize
loadKudos();
