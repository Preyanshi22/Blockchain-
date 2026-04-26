import React, { useState, useEffect, useCallback, useRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { sha256 } from '../utils/hashing';

const INITIAL_CHAIN = [
  { id: 1, nonce: 72608, data: "Genesis Block - Arbitrum Foundation", computedPrevHash: "0000000000000000000000000000000000000000000000000000000000000000", hash: "" },
  { id: 2, nonce: 83291, data: "Alice sends 5 ETH to Bob\nBob sends 2 ETH to Charlie", computedPrevHash: "", hash: "" },
  { id: 3, nonce: 12903, data: "Charlie deploys Smart Contract 0x9f...", computedPrevHash: "", hash: "" }
];

const Connector = ({ isValid }) => {
  if (isValid) {
    return (
      <div className="chain-connector-box">
        <svg width="60" height="40" viewBox="0 0 60 40">
          <line x1="0" y1="20" x2="60" y2="20" stroke="rgba(40,160,240,0.4)" strokeWidth="2" />
          <ellipse cx="20" cy="20" rx="8" ry="5" fill="none" stroke="var(--arb-blue)" strokeWidth="1.5" className="connector-pulse" />
          <ellipse cx="30" cy="20" rx="8" ry="5" fill="none" stroke="var(--arb-blue)" strokeWidth="1.5" className="connector-pulse-delay-1" />
          <ellipse cx="40" cy="20" rx="8" ry="5" fill="none" stroke="var(--arb-blue)" strokeWidth="1.5" className="connector-pulse-delay-2" />
          <polygon points="56,16 60,20 56,24" fill="var(--arb-blue)" />
        </svg>
      </div>
    );
  }
  return (
    <div className="chain-connector-box broken">
      <svg width="60" height="40" viewBox="0 0 60 40">
        <line x1="0" y1="20" x2="25" y2="20" stroke="rgba(255,69,96,0.6)" strokeWidth="2" />
        <line x1="35" y1="20" x2="60" y2="20" stroke="rgba(255,69,96,0.6)" strokeWidth="2" />
        <ellipse cx="16" cy="20" rx="8" ry="5" fill="none" stroke="var(--arb-red)" strokeWidth="1.5" transform="rotate(-15 16 20)" />
        <ellipse cx="44" cy="20" rx="8" ry="5" fill="none" stroke="var(--arb-red)" strokeWidth="1.5" transform="rotate(15 44 20)" />
        <path d="M 28 15 L 30 20 L 26 21 L 32 25" fill="none" stroke="var(--arb-red)" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

const Simulator = () => {
  useScrollReveal();
  const [chain, setChain] = useState(INITIAL_CHAIN);
  const [difficulty, setDifficulty] = useState("0");
  const [miningId, setMiningId] = useState(null);
  const [stats, setStats] = useState({ nonces: 0, blocks: 0 });
  const [scrambledHash, setScrambledHash] = useState({});

  const updateChain = useCallback(async (currentChain, diff) => {
    let newChain = [...currentChain];
    let isBroken = false;

    for (let i = 0; i < newChain.length; i++) {
      if (i > 0) {
        newChain[i].computedPrevHash = newChain[i - 1].hash;
      }
      const msg = `${newChain[i].id}${newChain[i].nonce}${newChain[i].data}${newChain[i].computedPrevHash}`;
      newChain[i].hash = await sha256(msg);
      newChain[i].isValid = newChain[i].hash.startsWith(diff) && !isBroken;
      if (!newChain[i].isValid) isBroken = true;
    }
    setChain(newChain);
  }, []);

  useEffect(() => {
    const init = async () => {
      let initialValidChain = JSON.parse(JSON.stringify(INITIAL_CHAIN));
      for (let i = 0; i < initialValidChain.length; i++) {
        if (i > 0) initialValidChain[i].computedPrevHash = initialValidChain[i - 1].hash;
        let nonce = 0;
        while (true) {
          const h = await sha256(`${initialValidChain[i].id}${nonce}${initialValidChain[i].data}${initialValidChain[i].computedPrevHash}`);
          if (h.startsWith("0")) {
            initialValidChain[i].nonce = nonce;
            initialValidChain[i].hash = h;
            initialValidChain[i].isValid = true;
            break;
          }
          nonce++;
        }
      }
      setChain(initialValidChain);
    };
    init();
  }, []);

  const handleDataChange = async (id, data) => {
    const newChain = chain.map(b => b.id === id ? { ...b, data } : b);
    updateChain(newChain, difficulty);
  };

  const spawnConfetti = (x, y) => {
    for (let i = 0; i < 16; i++) {
      let c = document.createElement('div');
      c.className = 'confetti';
      c.style.width = '6px'; c.style.height = '6px';
      const cols = ['#28A0F0', '#00D4FF', '#7B2FBE', '#00ff94'];
      c.style.background = cols[Math.floor(Math.random() * cols.length)];
      c.style.left = x + 'px';
      c.style.top = y + 'px';
      document.body.appendChild(c);

      const tx = (Math.random() - 0.5) * 240; const ty = -20 - Math.random() * 130;
      c.animate([
        { transform: 'translate(0,0) scale(0)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(1)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${tx}px, ${ty}px) scale(1)`, opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });
      setTimeout(() => c.remove(), 800);
    }
  };

  const mineBlock = async (id, e) => {
    setMiningId(id);
    const block = chain.find(b => b.id === id);
    let n = 0;
    let h = '';
    
    const chars = '0123456789abcdef';
    const scrambleInterval = setInterval(() => {
      let s = '';
      for (let i = 0; i < 64; i++) s += chars[Math.floor(Math.random() * 16)];
      setScrambledHash(prev => ({ ...prev, [id]: s }));
    }, 50);

    while (true) {
      n++;
      h = await sha256(`${block.id}${n}${block.data}${block.computedPrevHash}`);
      if (h.startsWith(difficulty)) break;
      if (n % 1000 === 0) await new Promise(r => setTimeout(r, 0));
    }

    clearInterval(scrambleInterval);
    setScrambledHash(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    const newChain = chain.map(b => b.id === id ? { ...b, nonce: n, hash: h } : b);
    updateChain(newChain, difficulty);
    setStats(prev => ({ nonces: prev.nonces + n, blocks: prev.blocks + 1 }));
    setMiningId(null);

    const rect = e.target.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top);
  };

  const isChainValid = chain.every(b => b.isValid);

  return (
    <>
      <div className="hero-layered">
        <div className="hero-scanline"></div>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ background: 'rgba(123,47,190,0.12)', border: '1px solid rgba(123,47,190,0.3)', padding: '6px 16px', borderRadius: '50px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', color: 'var(--text-primary)', marginBottom: '12px' }}>
              ⛏ PROOF OF WORK SIMULATOR
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', background: 'linear-gradient(135deg, #F0F8FF 0%, #28A0F0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Blockchain Mining Simulator</h1>
            <p style={{ fontFamily: "'Inter'", fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '10px' }}>Mine hashes. Break the chain. Master immutability.</p>
          </div>
          <div className="glass-card" style={{ display: 'inline-flex', gap: '32px', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Total Nonces</span>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: '1.1rem', color: 'white' }}>{stats.nonces.toLocaleString()}</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Chain Status</span>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: '1.1rem', color: isChainValid ? 'var(--arb-green)' : 'var(--arb-red)' }}>
                {isChainValid ? '✓ VALID' : '✗ BROKEN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="controls-row">
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>Mining Difficulty</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[{ p: '0', l: 'Easy' }, { p: '00', l: 'Medium' }, { p: '000', l: 'Hard' }].map(d => (
              <button key={d.p} className={`diff-pill ${difficulty === d.p ? 'active' : ''}`} onClick={() => setDifficulty(d.p)}>
                {d.l}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={async () => {
          setChain(INITIAL_CHAIN);
          updateChain(INITIAL_CHAIN, difficulty);
        }}>Reset Chain</button>
      </div>

      <div className="chain-layout">
        {chain.map((block, i) => (
          <React.Fragment key={block.id}>
            <div className={`block-card ${block.isValid ? '' : 'invalid'} ${miningId === block.id ? 'mining' : ''}`}>
              <div className="block-header">
                <div style={{ fontWeight: 700, color: 'white' }}>Block #{block.id}</div>
                <div style={{ 
                  background: block.isValid ? 'rgba(0,255,148,0.1)' : 'rgba(255,69,96,0.1)', 
                  border: `1px solid ${block.isValid ? 'rgba(0,255,148,0.3)' : 'rgba(255,69,96,0.3)'}`,
                  color: block.isValid ? 'var(--arb-green)' : 'var(--arb-red)', 
                  padding: '3px 10px', borderRadius: '6px', fontSize: '0.7rem' 
                }}>
                  {block.isValid ? '🔒 Valid' : '🔓 Invalid'}
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <label>Block Data:</label>
                <textarea className="block-textarea" value={block.data} onChange={(e) => handleDataChange(block.id, e.target.value)} />
                
                <label>Nonce:</label>
                <input className="block-input-ro" value={block.nonce} readOnly style={{ color: 'var(--arb-cyan)' }} />

                <label>Prev Hash:</label>
                <input className="block-input-ro" value={block.computedPrevHash} readOnly />

                <label>Hash:</label>
                <div className={`hash-display ${block.isValid ? 'valid' : 'invalid'}`} style={{ color: scrambledHash[block.id] ? 'var(--arb-cyan)' : '' }}>
                  {scrambledHash[block.id] || block.hash}
                </div>

                <button 
                  className={`mine-btn ${miningId === block.id ? 'mining' : 'default'}`} 
                  onClick={(e) => mineBlock(block.id, e)}
                  disabled={miningId !== null}
                >
                  {miningId === block.id ? '⛏ Mining...' : `⛏ Mine Block #${block.id}`}
                </button>
              </div>
            </div>
            {i < chain.length - 1 && <Connector isValid={block.isValid && chain[i+1].isValid} />}
          </React.Fragment>
        ))}
      </div>

      <div className={`chain-status-bar ${isChainValid ? 'valid' : 'invalid'}`} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', zIndex: 100 }}>
        <span className={isChainValid ? 'pulse-dot-live' : ''}>{isChainValid ? '' : '⚠️'}</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, color: isChainValid ? 'var(--arb-green)' : 'var(--arb-red)' }}>
          {isChainValid ? '✓ Blockchain Integrity: VALID' : '✗ Chain Integrity Violated'}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 'auto' }}>
          {isChainValid ? 'All blocks are properly linked and hashed' : 'Block data was modified. Re-mine to restore the chain.'}
        </span>
      </div>
    </>
  );
};

export default Simulator;
