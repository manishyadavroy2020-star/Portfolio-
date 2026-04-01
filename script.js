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

// 6. Portfolio Logistics (Text Cards Only)
const PORTFOLIO_PROJECTS = [
  { name: "Madhumobile", cat: "E-Commerce / Business", url: "https://madhumobile.pages.dev" },
  { name: "Uday Classes", cat: "Education Platform", url: "https://udayclasses.pages.dev" },
  { name: "Car Demo", cat: "Automotive Service", url: "https://car-demo-sigma.vercel.app/" },
  { name: "Gheewala", cat: "Premium UI/UX", url: "https://gheewala.pages.dev" }
];

function renderPortfolio() {
  const grid = document.getElementById('portGrid');
  if(!grid) return;

  grid.innerHTML = PORTFOLIO_PROJECTS.map(p => `
    <div class="port-card card-hover">
      <div class="port-cat">${p.cat}</div>
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

// Initial render
renderPortfolio();
