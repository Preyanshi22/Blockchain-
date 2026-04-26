import React, { useEffect, useState } from 'react';

const SplashScreen = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const isFirstLoad = !sessionStorage.getItem('splashed');
    if (!isFirstLoad) {
      setVisible(false);
      return;
    }

    sessionStorage.setItem('splashed', 'true');
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="splash-screen" id="splash">
      <div className="splash-logo">
        <svg viewBox="0 0 100 100">
          <path d="M50 10 L80 90 L20 40 L80 40 L20 90 Z" />
        </svg>
      </div>
      <h3 className="splash-text">Initializing Web3 Experience...</h3>
      <div className="splash-progress-bar"></div>
    </div>
  );
};

export default SplashScreen;
