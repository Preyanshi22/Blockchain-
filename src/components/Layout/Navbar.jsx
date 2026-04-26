import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo trans-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--arb-cyan)" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <div><span className="arbi">Arbi</span>Learn</div>
        </Link>
        <button className="hamburger" id="hamburger-btn" onClick={toggleMenu}>
          {isOpen ? '✕' : '☰'}
        </button>
        <ul className={`nav-links ${isOpen ? 'nav-open' : ''}`} id="nav-links">
          <li><Link to="/" className={`trans-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/concepts" className={`trans-link ${location.pathname === '/concepts' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Concepts</Link></li>
          <li><Link to="/prices" className={`trans-link ${location.pathname === '/prices' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Live Prices</Link></li>
          <li><Link to="/simulator" className={`trans-link ${location.pathname === '/simulator' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Simulator</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
