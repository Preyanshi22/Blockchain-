import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';

const Home = () => {
  useScrollReveal();
  const [rollupStep, setRollupStep] = useState(0);
  const [rollupDesc, setRollupDesc] = useState('');

  const handleRollupStep = (step) => {
    setRollupStep(step);
    if (step === 0) {
      setRollupDesc('');
    } else if (step === 1) {
      setRollupDesc('> Network nodes receive thousands of raw pending transactions instantly...');
    } else if (step === 2) {
      setRollupDesc('> Sequencer tightly zips and compresses all data off-chain into one batch...');
    } else if (step === 3) {
      setRollupDesc('> Bundle posted explicitly to Ethereum L1 mainnet. Inherits full security!');
    }
  };

  useEffect(() => {
    // Add bounce animation style
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem', marginTop: '4rem' }}>
          
          {/* Left Side */}
          <div style={{ flex: 1, minWidth: '300px' }} className="slide-right visible">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(40,160,240,0.1)', border: '1px solid var(--arb-blue)', padding: '6px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--arb-cyan)', marginBottom: '1.5rem', boxShadow: 'inset 0 0 10px rgba(40,160,240,0.2)' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--arb-cyan)', borderRadius: '50%', boxShadow: 'var(--glow-cyan)', animation: 'ripple-anim 2s infinite alternate' }}></div>
              Built on Arbitrum One
            </div>
            
            <h1 className="text-gradient" style={{ marginBottom: '1.5rem' }}>The Future of Ethereum is Layer 2</h1>
            
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '550px' }}>
              Scaling solutions shouldn't be complicated. Experience the raw speed, minimal fees, and cryptographic security of the world's most adopted optimistic rollup.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link to="/concepts" className="btn btn-primary trans-link">Explore Concepts <i className="fa-solid fa-arrow-right"></i></Link>
              <Link to="/prices" className="btn btn-secondary trans-link">Live Markets <i className="fa-solid fa-chart-line"></i></Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>🔐 Trustless</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>⚡ 40,000 TPS</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>💰 $0.01 Fees</div>
            </div>
          </div>

          {/* Right Side: SVG Diagram */}
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center' }} className="scroll-reveal visible">
            <div className="flow-diagram-container">
              <svg viewBox="0 0 400 250" className="flow-svg">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--arb-purple)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--arb-blue)" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                
                <rect x="25" y="85" width="110" height="80" rx="16" fill="rgba(123,47,190,0.15)" stroke="var(--arb-purple)" strokeWidth="2"/>
                <text x="80" y="125" fill="white" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="14">Ethereum</text>
                <text x="80" y="145" fill="var(--arb-purple)" textAnchor="middle" fontFamily="Inter" fontSize="12" fontWeight="600">L1 Base</text>
                
                <rect x="265" y="85" width="110" height="80" rx="16" fill="rgba(40,160,240,0.15)" stroke="var(--arb-blue)" strokeWidth="2"/>
                <text x="320" y="125" fill="white" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="14">Arbitrum</text>
                <text x="320" y="145" fill="var(--arb-cyan)" textAnchor="middle" fontFamily="Inter" fontSize="12" fontWeight="600">L2 Scale</text>
                
                <path id="bridgeUp" d="M 135 110 Q 200 40 265 110" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="8 6"/>
                <path id="bridgeDown" d="M 265 140 Q 200 210 135 140" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="8 6"/>
                
                <circle cx="0" cy="0" r="6" fill="var(--arb-cyan)">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 135 110 Q 200 40 265 110"/>
                </circle>
                <circle cx="0" cy="0" r="6" fill="var(--arb-purple)">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 265 140 Q 200 210 135 140"/>
                </circle>
                
                <text id="confirmTxt" x="320" y="185" fill="var(--arb-green)" textAnchor="middle" fontFamily="Inter" fontSize="12" fontWeight="bold">
                  ✓ Confirmed
                  <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
                </text>
              </svg>
            </div>
          </div>

        </div>
        
        {/* Bouncing Arrow */}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <i className="fa-solid fa-chevron-down" style={{ color: 'var(--arb-cyan)', fontSize: '1.5rem', animation: 'bounce 2s infinite' }}></i>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="scroll-reveal">
        <div className="glass-card stats-bar" style={{ borderRadius: '20px', padding: '2.5rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          <div className="stat-counter">
            <i className="fa-solid fa-bolt" style={{ color: 'var(--arb-cyan)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
            <div className="stat-val" data-target="40000" data-suffix="+">0</div>
            <div className="stat-label">TPS Capacity</div>
          </div>
          <div className="stat-counter">
            <i className="fa-solid fa-gas-pump" style={{ color: 'var(--arb-blue)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
            <div className="stat-val" data-target="0.05" data-prefix="$">0</div>
            <div className="stat-label">Avg Tx Cost</div>
          </div>
          <div className="stat-counter">
            <i className="fa-solid fa-server" style={{ color: 'var(--arb-purple)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
            <div className="stat-val" data-target="99.9" data-suffix="%">0</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-counter">
            <i className="fa-solid fa-globe" style={{ color: 'var(--arb-green)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
            <div className="stat-val" data-target="500" data-suffix="M+">0</div>
            <div className="stat-label">Transactions</div>
          </div>
        </div>
      </section>

      {/* WHY L2 TIMELINE */}
      <section>
        <h2 className="text-gradient slide-right" style={{ textAlign: 'center' }}>The Road to Scaling</h2>
        <p className="scroll-reveal" style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Why Ethereum fundamentally required a Layer 2 intervention.</p>
        
        <div className="timeline-container">
          <div className="timeline-item scroll-reveal">
            <div className="glass-card">
              <h3 style={{ color: 'var(--arb-red)', marginBottom: '1rem' }}><i className="fa-solid fa-snail"></i> Network Congestion</h3>
              <p>During massive NFT mints or volatile bull runs, Ethereum's 15 TPS block limits are fundamentally saturated. In 2017, just one dApp severely choked the entire global ledger.</p>
            </div>
          </div>
          <div className="timeline-item scroll-reveal">
            <div className="glass-card">
              <h3 style={{ color: '#ffaa50', marginBottom: '1rem' }}><i className="fa-solid fa-money-bill-wave"></i> The Gas Fee Crisis</h3>
              <p>High demand bids up block inclusion. Ordinary users faced $200 fees just to swap small tokens. Decentralized finance became a playground restricted strictly to whales.</p>
            </div>
          </div>
          <div className="timeline-item scroll-reveal">
            <div className="glass-card">
              <h3 style={{ color: 'var(--arb-cyan)', marginBottom: '1rem' }}><i className="fa-solid fa-chart-line"></i> The Scalability Wall</h3>
              <p>A global financial system physically cannot operate entirely natively on a single layer. Visa handles 24,000 TPS. Rollups became the only mathematically sound solution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ROLLUP EXPLAINER */}
      <section>
        <div className="glass-card rollup-container scroll-reveal">
          <h2 className="text-gradient" style={{ marginBottom: '0.5rem' }}>Interactive Optimistic Rollup</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Watch how Arbitrum processes transactions behind the scenes.</p>
          
          <div className="rollup-stage" id="ru-stage">
            <div className="ru-tx" id="ru-tx1" style={{ 
              left: rollupStep === 0 ? '10%' : rollupStep === 1 ? '10%' : '45%', 
              top: rollupStep === 0 ? '40%' : rollupStep === 1 ? '40%' : '45%',
              opacity: rollupStep === 0 ? 0 : rollupStep === 1 ? 1 : 0,
              transform: rollupStep === 2 ? 'scale(0.2)' : 'scale(1)',
              transition: 'all 0.6s ease'
            }}></div>
            <div className="ru-tx" id="ru-tx2" style={{ 
              left: rollupStep === 0 ? '15%' : rollupStep === 1 ? '15%' : '45%', 
              top: rollupStep === 0 ? '60%' : rollupStep === 1 ? '60%' : '45%',
              opacity: rollupStep === 0 ? 0 : rollupStep === 1 ? 1 : 0,
              transform: rollupStep === 2 ? 'scale(0.2)' : 'scale(1)',
              transition: 'all 0.6s ease'
            }}></div>
            <div className="ru-tx" id="ru-tx3" style={{ 
              left: rollupStep === 0 ? '20%' : rollupStep === 1 ? '20%' : '45%', 
              top: rollupStep === 0 ? '30%' : rollupStep === 1 ? '30%' : '45%',
              opacity: rollupStep === 0 ? 0 : rollupStep === 1 ? 1 : 0,
              transform: rollupStep === 2 ? 'scale(0.2)' : 'scale(1)',
              transition: 'all 0.6s ease'
            }}></div>
            
            <div className="ru-bundle" id="ru-bundle" style={{ 
              left: rollupStep === 3 ? '80%' : '45%', 
              top: rollupStep === 3 ? '50%' : '25%',
              opacity: rollupStep >= 2 ? 1 : 0,
              transform: rollupStep === 3 ? 'scale(0.5)' : 'scale(1)',
              boxShadow: rollupStep === 3 ? 'var(--glow-blue)' : 'var(--glow-purple)',
              transition: 'all 0.6s ease'
            }}>Compressed Bundle</div>
            
            <div className="ru-eth" id="ru-eth" style={{ right: '5%', top: '10%', height: '160px', width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', writingMode: 'vertical-rl' }}>Ethereum L1</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => handleRollupStep(1)}>1. Users Send Txs</button>
            <button className="btn btn-secondary" onClick={() => handleRollupStep(2)}>2. Batch & Compress</button>
            <button className="btn btn-secondary" onClick={() => handleRollupStep(3)}>3. Post to L1 Proof</button>
            <button className="btn btn-danger" onClick={() => handleRollupStep(0)}><i className="fa-solid fa-rotate-left"></i> Reset</button>
          </div>
          
          <p id="ru-desc" style={{ marginTop: '2rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--arb-cyan)', height: '40px' }}>{rollupDesc}</p>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section>
        <h2 className="text-gradient slide-right">Raw Performance Metrics</h2>
        <table className="competitor-table scroll-reveal">
          <thead>
            <tr>
              <th>Feature Matrix</th>
              <th>Ethereum Mainnet</th>
              <th>Arbitrum One</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            <tr className="scroll-reveal">
              <td>Avg Gas Transfer</td>
              <td className="table-mainnet">~$10 – $50</td>
              <td className="table-arbitrum">~$0.05</td>
              <td><i className="fa-solid fa-trophy" style={{ color: '#ffd700' }}></i></td>
            </tr>
            <tr className="scroll-reveal">
              <td>Transactions Per Second</td>
              <td className="table-mainnet">~ 15 TPS</td>
              <td className="table-arbitrum">Unlimited (40k+)</td>
              <td><i className="fa-solid fa-trophy" style={{ color: '#ffd700' }}></i></td>
            </tr>
            <tr className="scroll-reveal">
              <td>Confirmation Finality</td>
              <td className="table-mainnet">12 seconds</td>
              <td className="table-arbitrum">1 second</td>
              <td><i className="fa-solid fa-trophy" style={{ color: '#ffd700' }}></i></td>
            </tr>
            <tr className="scroll-reveal">
              <td>Solidity / EVM</td>
              <td>Native Level 1</td>
              <td className="table-arbitrum">Fully Compatible</td>
              <td>Tie</td>
            </tr>
            <tr className="scroll-reveal">
              <td>Underlying Security</td>
              <td>Highest Global Security</td>
              <td className="table-arbitrum">Inherits L1 completely</td>
              <td>Tie</td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
};

export default Home;
