import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BackgroundCanvas from './BackgroundCanvas';
import SplashScreen from './SplashScreen';
import CustomCursor from './CustomCursor';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <>
      <SplashScreen />
      <CustomCursor />
      <BackgroundCanvas />
      <div className="nebula-blob blob-1"></div>
      <div className="nebula-blob blob-2"></div>
      <div className="nebula-blob blob-3"></div>
      <Navbar />
      <div key={location.pathname} className="page-transition">
        <main className="container">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
