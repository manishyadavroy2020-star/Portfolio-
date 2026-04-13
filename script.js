// 1. Lenis Smooth Scroll Setup
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// 2. Cursor Glow & Scroll Progress
const cursorGlow = document.getElementById('cursorGlow');
const dCursor = document.getElementById('dCursor');
const progress = document.getElementById('scrollProgress');

const isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

if (isTouch) {
  if (cursorGlow) cursorGlow.style.display = 'none';
  if (dCursor) dCursor.style.display = 'none';
  document.body.style.cursor = 'auto';
} else {
  document.addEventListener('mousemove', (e) => {
    if (cursorGlow) { cursorGlow.style.left = e.clientX + 'px'; cursorGlow.style.top = e.clientY + 'px'; }
    if (dCursor) { dCursor.style.left = e.clientX + 'px'; dCursor.style.top = e.clientY + 'px'; }
  });
}

window.addEventListener('scroll', () => {
  // Progress
  let scrollTop = window.scrollY;
  let docHeight = document.body.offsetHeight;
  let winHeight = window.innerHeight;
  let scrollPercent = scrollTop / (docHeight - winHeight);
  if (progress) progress.style.width = scrollPercent * 100 + '%';

  // Navbar glass logic
  const nav = document.getElementById('navbar');
  if (nav) {
    if(scrollTop > 50) nav.style.background = 'rgba(3, 3, 3, 0.85)';
    else nav.style.background = 'rgba(3, 3, 3, 0.4)';
  }
});

// 3. Loader
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1300);
});

// 4. Reveal Animations (Intersection Observer)
const observeres = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.classList.add('active');
      observeres.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observeres.observe(el));

// 4.5. Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if(menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });
}

// 5. Magnetic Buttons
if (!isTouch) {
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px) scale(1.05)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px) scale(1)`;
    });
  });

  // Glass Card Hover Effect (radial gradient follow)
  document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// 6. Google Sheets Integration & Dashboard Logic
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzx8mQCwjk55DZYfRLKP584Xi-cC160igeiB_voPdlLhOFOVGS6oktu8hgBNjTLzEgN/exec';
let PORTFOLIO_PROJECTS = [];

// SHA-256-like Obfuscation (Works even on file:// urls)
const AUTH_CODE = "bWFuaXNoMTIz"; // This is 'manish123' obfuscated

function openAdminModal() { 
  document.getElementById('adminModal').classList.add('open'); 
  document.getElementById('adminPass').focus();
}
function closeAdminModal() { document.getElementById('adminModal').classList.remove('open'); }

async function checkAdmin() {
  const passInput = document.getElementById('adminPass');
  // Obfuscate the input for comparison
  const encodedInput = btoa(passInput.value);
  
  if(encodedInput === AUTH_CODE) {
    closeAdminModal();
    openDashboard();
    sessionStorage.setItem('admin_session', passInput.value); 
    passInput.value = '';
  } else {
    alert("Unauthorized: Access Denied.");
    passInput.value = '';
  }
}

function openDashboard() {
  document.getElementById('adminDashboard').classList.add('open');
  renderLiveList();
}
function closeDashboard() { document.getElementById('adminDashboard').classList.remove('open'); }

async function fetchProjects() {
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();
    PORTFOLIO_PROJECTS = data;
    renderPortfolio();
    if(document.getElementById('adminDashboard').classList.contains('open')) renderLiveList();
  } catch (err) {
    console.error("Connectivity issue:", err);
  }
}

function renderPortfolio() {
  const grid = document.getElementById('portGrid');
  if(!grid) return;

  if (PORTFOLIO_PROJECTS.length === 0) {
    grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">No projects found.</p>';
    return;
  }

  grid.innerHTML = PORTFOLIO_PROJECTS.map(p => `
    <div class="port-card card-hover">
      <div class="port-cat">${p.category || p.cat || 'Web Project'}</div>
      <div class="port-name">${p.name}</div>
      <a href="${p.url}" target="_blank" class="port-link">View Live Demo ↗️</a>
    </div>
  `).join('');

  if (!isTouch) {
    document.querySelectorAll('.port-card.card-hover').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    });
  }
}

function renderLiveList() {
  const list = document.getElementById('liveProjectList');
  if(!list) return;
  list.innerHTML = PORTFOLIO_PROJECTS.map(p => `
    <div class="dash-item">
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">${p.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${p.category || p.cat}</div>
      </div>
      <a href="${p.url}" target="_blank" style="font-size: 0.7rem; color: var(--cyan);">View ↗</a>
    </div>
  `).join('');
}

async function submitNewWork() {
  const name = document.getElementById('pName').value;
  const cat = document.getElementById('pCat').value;
  const url = document.getElementById('pUrl').value;
  const btn = document.getElementById('addWorkBtn');
  const password = sessionStorage.getItem('admin_session');

  if(!name || !cat || !url) { alert("Fields cannot be empty"); return; }
  if(!password) { alert("Session expired. Please re-login."); return; }

  btn.innerText = "Encrypting & Sending...";
  btn.disabled = true;

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ name, cat, url, password }) // Send password for server-side verification
    });
    
    const result = await response.json();
    if(result.status === 'success') {
      alert("Project published successfully!");
      document.getElementById('pName').value = '';
      document.getElementById('pCat').value = '';
      document.getElementById('pUrl').value = '';
      fetchProjects();
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    alert("Connection failed. Check your internet.");
  } finally {
    btn.innerText = "Add To Portfolio";
    btn.disabled = false;
  }
}

// 7. Theme Toggle Logic
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateThemeUI(isLight);
}

function updateThemeUI(isLight) {
  const btn = document.getElementById('themeToggle');
  const mBtn = document.getElementById('mobileThemeToggle');
  if(btn) btn.innerText = isLight ? '☀️' : '🌙';
  if(mBtn) mBtn.innerText = isLight ? 'Switch Theme ☀️' : 'Switch Theme 🌙';
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    document.body.classList.add('light-theme');
    updateThemeUI(true);
  } else {
    updateThemeUI(false);
  }
}

// Initial fetch & Theme init
initTheme();
fetchProjects();
