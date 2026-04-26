import { useEffect } from 'react';

const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
            
            // Count up logic for stat-val elements
            if (entry.target.classList.contains('stat-val') && !entry.target.dataset.counted) {
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
          }, i * 80);
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.scroll-reveal, .slide-right, .timeline-item, .competitor-table tr, .stat-val');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);
};

export default useScrollReveal;
