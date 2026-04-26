import React, { useEffect, useRef } from 'react';

const BackgroundCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const stars = Array(200).fill().map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5,
      a: Math.random()
    }));
    let shooting = null;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Cyber Grid
      ctx.strokeStyle = 'rgba(40,160,240,0.06)';
      ctx.lineWidth = 1;

      // Moving grid
      const offset = (Date.now() / 50) % 50;

      // Draw horizon perspective grid approx
      for (let i = 0; i < w; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += 60) {
        ctx.beginPath();
        ctx.moveTo(0, i + offset);
        ctx.lineTo(w, i + offset);
        ctx.stroke();
      }

      // Stars
      ctx.fillStyle = '#fff';
      stars.forEach(s => {
        s.y += 0.2;
        s.x += 0.1;
        if (s.y > h) s.y = 0;
        if (s.x > w) s.x = 0;
        ctx.globalAlpha = Math.abs(Math.sin(s.a += 0.02)) * 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Shooting star
      if (Math.random() < 0.005 && !shooting) {
        shooting = {
          x: Math.random() * w,
          y: 0,
          len: Math.random() * 100 + 50,
          speed: Math.random() * 12 + 10,
          angle: Math.PI / 3
        };
      }
      if (shooting) {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(shooting.x - Math.cos(shooting.angle) * shooting.len, shooting.y - Math.sin(shooting.angle) * shooting.len);
        ctx.stroke();
        shooting.x += Math.cos(shooting.angle) * shooting.speed;
        shooting.y += Math.sin(shooting.angle) * shooting.speed;
        if (shooting.y > h || shooting.x < 0) shooting = null;
      }

      requestAnimationFrame(draw);
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas id="bg-canvas" ref={canvasRef}></canvas>;
};

export default BackgroundCanvas;
