(function() {
  // Create dot element
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  document.body.appendChild(dot);

  // Create ring element  
  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  document.body.appendChild(ring);

  // Track real mouse position
  let mX = window.innerWidth / 2;
  let mY = window.innerHeight / 2;

  // Track ring position (lerped)
  let rX = window.innerWidth / 2;
  let rY = window.innerHeight / 2;

  // CRITICAL: Use clientX/clientY — NOT pageX/pageY
  // clientX/clientY is always relative to viewport — scroll has zero effect
  document.addEventListener('mousemove', function(e) {
    mX = e.clientX;
    mY = e.clientY;
  }, { passive: true });

  // Dot is positioned using fixed positioning + clientX/clientY
  // So scroll NEVER affects it — it always stays with the real cursor
  function tick() {
    // Dot: instant — set directly, no lerp
    dot.style.left = mX + 'px';
    dot.style.top  = mY + 'px';

    // Ring: smooth lerp — trails behind naturally
    rX += (mX - rX) * 0.10;
    rY += (mY - rY) * 0.10;
    ring.style.left = rX + 'px';
    ring.style.top  = rY + 'px';

    requestAnimationFrame(tick);
  }
  // Start the animation loop immediately
  requestAnimationFrame(tick);

  // Hover effect — expand ring, shrink dot
  function addHoverListeners() {
    document.querySelectorAll('a, button, input, textarea, select, [role="button"], label')
    .forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        dot.classList.add('active');
        ring.classList.add('active');
      }, { passive: true });
      el.addEventListener('mouseleave', function() {
        dot.classList.remove('active');
        ring.classList.remove('active');
      }, { passive: true });
    });
  }
  addHoverListeners();

  // Re-run hover listeners if new elements are added dynamically
  // (e.g. price cards loaded from API)
  const observer = new MutationObserver(function() {
    addHoverListeners();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Click effect — quick scale pulse on dot
  document.addEventListener('mousedown', function() {
    dot.classList.add('clicking');
  }, { passive: true });
  document.addEventListener('mouseup', function() {
    dot.classList.remove('clicking');
  }, { passive: true });

  // Hide both elements when mouse leaves the browser window entirely
  document.addEventListener('mouseleave', function() {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  }, { passive: true });
  document.addEventListener('mouseenter', function() {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  }, { passive: true });

})();
