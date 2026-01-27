/* =========================================================
   kudos.js
   Rotating kudos showcase for homepage
   ========================================================= */

let kudosData = [];
let currentIndex = 0;
let autoRotateInterval = null;

// Load kudos from JSON
async function loadKudosData() {
  try {
    const response = await fetch('./kudos.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load kudos');
    const data = await response.json();
    
    // Filter to show only approved kudos from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    kudosData = (data.kudos || [])
      .filter(k => k.status === 'approved')
      .filter(k => new Date(k.date) > sevenDaysAgo)
      .sort((a, b) => {
        // Pinned items first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Then by date (newest first)
        return new Date(b.date) - new Date(a.date);
      });
    
    renderKudosShowcase();
    startAutoRotate();
  } catch (error) {
    console.error('Error loading kudos:', error);
    showEmptyState();
  }
}

// Render the kudos showcase
function renderKudosShowcase() {
  const container = document.getElementById('kudosShowcase');
  
  if (!kudosData || kudosData.length === 0) {
    showEmptyState();
    return;
  }
  
  // Build the HTML
  let html = '';
  
  kudosData.forEach((kudos, index) => {
    const date = new Date(kudos.date);
    const dateStr = date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    html += `
      <div class="kudos-card ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="kudos-from-to">
          ${kudos.from} → ${kudos.to}
          ${kudos.pinned ? ' 📌' : ''}
        </div>
        <div class="kudos-category-badge">${kudos.category}</div>
        <div class="kudos-message">"${kudos.message}"</div>
        <div class="kudos-date">${dateStr}</div>
      </div>
    `;
  });
  
  // Add navigation if more than 1 kudos
  if (kudosData.length > 1) {
    html += `
      <div class="kudos-nav">
        <div class="kudos-dots">
          ${kudosData.map((_, i) => `
            <div class="kudos-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
          `).join('')}
        </div>
        <div class="kudos-controls">
          <button class="kudos-btn" id="kudosPrev">‹</button>
          <button class="kudos-btn" id="kudosNext">›</button>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
  
  // Add event listeners
  if (kudosData.length > 1) {
    document.getElementById('kudosPrev')?.addEventListener('click', showPrevKudos);
    document.getElementById('kudosNext')?.addEventListener('click', showNextKudos);
    
    document.querySelectorAll('.kudos-dot').forEach(dot => {
      dot.addEventListener('click', function() {
        showKudos(parseInt(this.dataset.index));
      });
    });
  }
}

// Show empty state
function showEmptyState() {
  const container = document.getElementById('kudosShowcase');
  container.innerHTML = `
    <div class="kudos-empty">
      <p>No recent kudos yet!</p>
      <p style="margin-top: 10px;">
        <a href="./kudos-submit.html" class="btn">Be the first to give kudos</a>
      </p>
    </div>
  `;
}

// Show specific kudos by index
function showKudos(index) {
  if (!kudosData || kudosData.length === 0) return;
  
  // Stop auto-rotate when user manually navigates
  stopAutoRotate();
  
  currentIndex = index;
  
  // Hide all cards
  document.querySelectorAll('.kudos-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Show selected card
  const selectedCard = document.querySelector(`[data-index="${index}"]`);
  if (selectedCard) {
    selectedCard.classList.add('active');
  }
  
  // Update dots
  document.querySelectorAll('.kudos-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
  
  // Restart auto-rotate after 10 seconds
  setTimeout(() => {
    startAutoRotate();
  }, 10000);
}

// Show next kudos
function showNextKudos() {
  const nextIndex = (currentIndex + 1) % kudosData.length;
  showKudos(nextIndex);
}

// Show previous kudos
function showPrevKudos() {
  const prevIndex = currentIndex === 0 ? kudosData.length - 1 : currentIndex - 1;
  showKudos(prevIndex);
}

// Auto-rotate kudos every 8 seconds
function startAutoRotate() {
  stopAutoRotate(); // Clear any existing interval
  
  if (kudosData.length > 1) {
    autoRotateInterval = setInterval(() => {
      showNextKudos();
    }, 8000);
  }
}

// Stop auto-rotate
function stopAutoRotate() {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval);
    autoRotateInterval = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadKudosData);
} else {
  loadKudosData();
}

// Pause auto-rotate when user is interacting with the page
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRotate();
  } else {
    startAutoRotate();
  }
});
