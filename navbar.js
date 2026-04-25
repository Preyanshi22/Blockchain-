// UI and Layout Global Controller
const loadLayout = (activeId) => {
  const body = document.body;
  
  // Custom Cursor logic injected via DOM
  
  // Splash Screen
  const isFirstLoad = !sessionStorage.getItem('splashed');
  const splashHTML = isFirstLoad ? `
    <div class="splash-screen" id="splash">
      <div class="splash-logo">
        <svg viewBox="0 0 100 100">
          <path d="M50 10 L80 90 L20 40 L80 40 L20 90 Z" />
        </svg>
      </div>
      <h3 class="splash-text">Initializing Web3 Experience...</h3>
      <div class="splash-progress-bar"></div>
    </div>
  ` : '';
  
  if (isFirstLoad) sessionStorage.setItem('splashed', 'true');

  // Background Canvas
  const bgHTML = `<canvas id="bg-canvas"></canvas>`;

  // Navbar
  const navHTML = `
    <nav class="navbar" id="navbar">
      <div class="container nav-container">
        <a href="index.html" class="nav-logo trans-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--arb-cyan)" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <div><span class="arbi">Arbi</span>Learn</div>
        </a>
        <button class="hamburger" id="hamburger-btn">☰</button>
        <ul class="nav-links" id="nav-links">
          <li><a href="index.html" class="trans-link ${activeId === 'home' ? 'active' : ''}">Home</a></li>
          <li><a href="concepts.html" class="trans-link ${activeId === 'concepts' ? 'active' : ''}">Concepts</a></li>
          <li><a href="prices.html" class="trans-link ${activeId === 'prices' ? 'active' : ''}">Live Prices</a></li>
          <li><a href="simulator.html" class="trans-link ${activeId === 'simulator' ? 'active' : ''}">Simulator</a></li>
        </ul>
      </div>
    </nav>
  `;

  // Nebulas
  const nebulasHTML = `
    <div class="nebula-blob blob-1"></div>
    <div class="nebula-blob blob-2"></div>
    <div class="nebula-blob blob-3"></div>
  `;

  const footerHTML = `
    <footer>
      <div class="container">
        <p style="color: var(--text-muted);"><b style="color: var(--arb-cyan);">ArbiLearn</b> — Built for Arbitrum Builder Labs by Preyanshi</p>
      </div>
    </footer>
  `;

  body.insertAdjacentHTML('afterbegin', splashHTML + bgHTML + nebulasHTML + navHTML);
  body.insertAdjacentHTML('beforeend', footerHTML);

  // --- LOGIC BINDINGS ---
  
  // 1. Splash Removal
  if (isFirstLoad) {
    setTimeout(() => {
      const splash = document.getElementById('splash');
      if(splash) {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 600);
      }
    }, 2000);
  }


  // 3. Canvas Background
  initCanvasBg();

  // 4. Navbar Scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // 5. Mobile Menu Switch
  const btn = document.getElementById('hamburger-btn');
  const links = document.getElementById('nav-links');
  if(btn) btn.addEventListener('click', () => links.classList.toggle('nav-open'));

  // 6. Ripple Effect purely dynamic
  document.addEventListener('mousedown', (e) => {
    const target = e.target.closest('.btn');
    if (!target) return;
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
  });

  // 7. Intersection Observer animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
          
          // Count up logic
          if(entry.target.classList.contains('stat-val') && !entry.target.dataset.counted) {
            entry.target.dataset.counted = "true";
            const targetVal = parseFloat(entry.target.dataset.target);
            let start = 0;
            const prefix = entry.target.dataset.prefix || '';
            const suffix = entry.target.dataset.suffix || '';
            const dur = 1500;
            const st = performance.now();
            const step = (t) => {
              let p = (t - st) / dur;
              if (p > 1) p = 1;
              const val = start + (targetVal - start) * (1 - Math.pow(1 - p, 3)); // cubic out
              entry.target.innerText = prefix + (val % 1 !== 0 ? val.toFixed(2) : Math.floor(val)) + suffix;
              if (p < 1) requestAnimationFrame(step);
              else entry.target.innerText = prefix + targetVal + suffix;
            };
            requestAnimationFrame(step);
          }
        }, i * 80); // Stagger
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-reveal, .slide-right, .timeline-item, .competitor-table tr, .stat-val').forEach(el => observer.observe(el));

  // 8. Page Transitions
  document.querySelectorAll('.trans-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if(link.target === '_blank' || link.href.includes('#') || link.href === window.location.href) return;
      e.preventDefault();
      document.querySelector('.page-transition').classList.add('exiting');
      setTimeout(() => window.location.href = link.href, 250);
    });
  });
};

// Canvas Logic
function initCanvasBg() {
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const stars = Array(200).fill().map(()=>({x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.5, a:Math.random()}));
  let shooting = null;

  function draw() {
    ctx.clearRect(0,0,w,h);
    
    // Cyber Grid
    ctx.strokeStyle = 'rgba(40,160,240,0.06)';
    ctx.lineWidth = 1;

    // Moving grid
    const offset = (Date.now() / 50) % 50;
    
    // Draw horizon perspective grid approx
    for(let i=0; i<w; i+=60) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for(let i=0; i<h; i+=60) { ctx.beginPath(); ctx.moveTo(0, i + offset); ctx.lineTo(w, i + offset); ctx.stroke(); }

    // Stars
    ctx.fillStyle = '#fff';
    stars.forEach(s => {
      s.y += 0.2;
      s.x += 0.1;
      if(s.y > h) s.y = 0;
      if(s.x > w) s.x = 0;
      ctx.globalAlpha = Math.abs(Math.sin(s.a += 0.02)) * 0.8;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Shooting star
    if(Math.random() < 0.005 && !shooting) {
      shooting = { x: Math.random()*w, y: 0, len: Math.random()*100+50, speed: Math.random()*12+10, angle: Math.PI/3 };
    }
    if(shooting) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y);
      ctx.lineTo(shooting.x - Math.cos(shooting.angle)*shooting.len, shooting.y - Math.sin(shooting.angle)*shooting.len);
      ctx.stroke();
      shooting.x += Math.cos(shooting.angle)*shooting.speed;
      shooting.y += Math.sin(shooting.angle)*shooting.speed;
      if(shooting.y > h || shooting.x < 0) shooting = null;
    }

    requestAnimationFrame(draw);
  }
  
  window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
  draw();
}
