const dot = document.createElement('div');
dot.className = 'cursor-dot';
const ring = document.createElement('div');
ring.className = 'cursor-ring';
document.body.appendChild(dot);
document.body.appendChild(ring);

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

// Dot follows mouse INSTANTLY via mousemove — no lerp on the dot
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

// Ring follows with smooth lerp — ONLY the ring lags slightly
function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover expand effect on interactive elements
const interactives = document.querySelectorAll(
  'a, button, input, textarea, select, label, [role="button"]'
);
interactives.forEach(el => {
  el.addEventListener('mouseenter', () => {
    dot.classList.add('hovering');
    ring.classList.add('hovering');
  });
  el.addEventListener('mouseleave', () => {
    dot.classList.remove('hovering');
    ring.classList.remove('hovering');
  });
});

// Hide cursor when mouse leaves window
document.addEventListener('mouseleave', () => {
  dot.style.opacity = '0';
  ring.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  dot.style.opacity = '1';
  ring.style.opacity = '1';
});

window.requeryCursor = () => {
  const dynInteractives = document.querySelectorAll('a, button, input, textarea, select, label, [role="button"], .glass-card, .flip-card');
  dynInteractives.forEach(el => {
    if(el.dataset.csrBnd) return;
    el.dataset.csrBnd = "1";
    el.addEventListener('mouseenter', () => { dot.classList.add('hovering'); ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hovering'); ring.classList.remove('hovering'); });
  });
};
window.requeryCursor();
