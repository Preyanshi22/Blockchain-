import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Concepts from './pages/Concepts';
import Prices from './pages/Prices';
import Simulator from './pages/Simulator';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/concepts" element={<Concepts />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
