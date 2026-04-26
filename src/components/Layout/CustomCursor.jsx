import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = () => dot.classList.add('clicking');
    const handleMouseUp = () => dot.classList.remove('clicking');
    const handleMouseLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };
    const handleMouseEnter = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isSelectable = target.closest('a, button, input, textarea, select, [role="button"], label');
      if (isSelectable) {
        dot.classList.add('active');
        ring.classList.add('active');
      } else {
        dot.classList.remove('active');
        ring.classList.remove('active');
      }
    };

    const tick = () => {
      const { x: mX, y: mY } = mousePos.current;
      const { x: rX, y: rY } = ringPos.current;

      dot.style.left = `${mX}px`;
      dot.style.top = `${mY}px`;

      const nextRX = rX + (mX - rX) * 0.15;
      const nextRY = rY + (mY - rY) * 0.15;
      ringPos.current = { x: nextRX, y: nextRY };

      ring.style.left = `${nextRX}px`;
      ring.style.top = `${nextRY}px`;

      requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    const animationId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" ref={dotRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>
    </>
  );
};

export default CustomCursor;
