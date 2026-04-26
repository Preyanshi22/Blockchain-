import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

const Concepts = () => {
  useScrollReveal();

  return (
    <div style={{ marginTop: '4rem' }}>
      <section className="scroll-reveal">
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '1rem' }}>Web3 & Layer 2 Concepts</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '4rem' }}>Master the fundamentals of the next-generation internet.</p>
        
        <div className="grid-3">
          <div className="glass-card scroll-reveal">
            <h3 style={{ color: 'var(--arb-cyan)', marginBottom: '1rem' }}><i className="fa-solid fa-layer-group"></i> Layer 1 vs Layer 2</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              Layer 1 (Ethereum) is the foundation. Layer 2 (Arbitrum) sits on top to handle high-speed transactions while sending the results back to Layer 1 for final security.
            </p>
          </div>
          <div className="glass-card scroll-reveal">
            <h3 style={{ color: 'var(--arb-purple)', marginBottom: '1rem' }}><i className="fa-solid fa-box-archive"></i> Optimistic Rollups</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              They "roll up" many transactions into a single batch. They are "optimistic" because they assume transactions are valid unless someone proves otherwise with a "fraud proof".
            </p>
          </div>
          <div className="glass-card scroll-reveal">
            <h3 style={{ color: 'var(--arb-green)', marginBottom: '1rem' }}><i className="fa-solid fa-shield-halved"></i> Shared Security</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              Arbitrum doesn't need its own set of miners. It uses Ethereum's massive security network to ensure that your funds and transactions are immutable and safe.
            </p>
          </div>
        </div>
      </section>

      {/* TECHNICAL DEEP DIVE */}
      <section style={{ marginTop: '6rem' }}>
        <h2 className="text-gradient slide-right" style={{ marginBottom: '3rem' }}>Technical Deep Dive</h2>
        <div className="grid-2">
          <div className="glass-card scroll-reveal">
            <h3 style={{ color: 'var(--arb-blue)', marginBottom: '1.5rem' }}>The Fraud Proof Mechanism</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              Unlike ZK-Rollups, Optimistic Rollups don't provide a proof for every batch. Instead, they provide a window of time where anyone can challenge the state. If a fraud is detected, the sequencer is penalized and the state is reverted.
            </p>
          </div>
          <div className="glass-card scroll-reveal">
            <h3 style={{ color: 'var(--arb-cyan)', marginBottom: '1.5rem' }}>The Role of the Sequencer</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              The Sequencer is a node responsible for ordering transactions, bundling them, and submitting them to the L1. It provides "soft finality" in milliseconds, while the L1 provides hard finality.
            </p>
          </div>
        </div>
      </section>

      {/* BLOCKCHAIN TRILEMMA */}
      <section style={{ marginTop: '6rem' }}>
        <div className="glass-card scroll-reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', padding: '3rem' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>The Blockchain Trilemma</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Historically, blockchains could only pick two: **Security**, **Decentralization**, or **Scalability**. 
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              Arbitrum solves this by offloading scalability to a second layer while keeping the security and decentralization of the Ethereum base layer.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--arb-blue)', borderRadius: '50%', margin: '0 auto', boxShadow: 'var(--glow-blue)' }}></div>
                <span style={{ fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>Scalability</span>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--arb-purple)', borderRadius: '50%', margin: '0 auto' }}></div>
                <span style={{ fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>Security</span>
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--arb-green)', borderRadius: '50%', margin: '0 auto' }}></div>
                <span style={{ fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>Decentralization</span>
              </div>
              <svg style={{ position: 'absolute', top: '30px', left: '30px', zIndex: -1 }} width="140" height="140">
                <polygon points="70,10 10,120 130,120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={{ marginTop: '6rem', marginBottom: '6rem' }}>
        <h2 className="text-gradient slide-right" style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {[
            { q: "Is Arbitrum a separate blockchain?", a: "No, it's a Layer 2 protocol that runs on top of Ethereum. It relies on Ethereum for security but processes transactions independently." },
            { q: "How much cheaper is Arbitrum?", a: "Typically 10-100x cheaper than Ethereum Mainnet, depending on network congestion and the type of transaction." },
            { q: "Can I use my existing Ethereum wallet?", a: "Yes! Arbitrum is fully EVM-compatible, meaning you can use MetaMask, Rabby, or any other Ethereum wallet by just switching the network." }
          ].map((faq, i) => (
            <div key={i} className="glass-card scroll-reveal" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>{faq.q}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Concepts;
