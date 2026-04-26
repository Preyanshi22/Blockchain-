import React, { useState, useEffect, useRef, useCallback } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,matic-network,arbitrum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_7d_sparkline=true';

const COIN_METADATA = {
  'bitcoin': { name: 'Bitcoin', ticker: 'BTC', img: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg', color: 'linear-gradient(90deg, #F7931A, #FFB347)' },
  'ethereum': { name: 'Ethereum', ticker: 'ETH', img: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg', color: 'linear-gradient(90deg, #627EEA, #A78BFA)' },
  'solana': { name: 'Solana', ticker: 'SOL', img: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png', color: 'linear-gradient(90deg, #9945FF, #14F195)' },
  'matic-network': { name: 'Polygon', ticker: 'MATIC', img: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=024', color: 'linear-gradient(90deg, #8247E5, #A78BFA)' },
  'arbitrum': { name: 'Arbitrum', ticker: 'ARB', img: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=024', color: 'linear-gradient(90deg, #28A0F0, #00D4FF)' }
};

const Sparkline = ({ dataPoints, isPositive }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dataPoints || dataPoints.length === 0) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = 60;

    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = (max - min) || 1;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();

    const step = w / (dataPoints.length - 1);
    const points = dataPoints.map((p, i) => ({
      x: i * step,
      y: h - ((p - min) / range) * h
    }));

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    ctx.strokeStyle = isPositive ? '#00ff94' : '#ff4560';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, isPositive ? 'rgba(0,255,148,0.08)' : 'rgba(255,69,96,0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
  }, [dataPoints, isPositive]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '60px' }} />;
};

const Prices = () => {
  useScrollReveal();
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('mcap');
  const [timer, setTimer] = useState(60);
  const [holdings, setHoldings] = useState(() => JSON.parse(localStorage.getItem('arbi_holdings') || '{}'));

  const timerRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('API Failed');
      const data = await res.json();
      setPrices(data);
      setError(false);
      setTimer(60);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          fetchPrices();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [fetchPrices]);

  useEffect(() => {
    localStorage.setItem('arbi_holdings', JSON.stringify(holdings));
  }, [holdings]);

  const formatNum = (num, isCurrency = true, compact = false) => {
    const opts = { style: isCurrency ? 'currency' : 'decimal', currency: 'USD' };
    if (compact) opts.notation = "compact";
    return new Intl.NumberFormat('en-US', opts).format(num);
  };

  const updateHolding = (id, val) => {
    setHoldings(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };

  const sortedCoins = prices ? Object.entries(prices)
    .map(([id, info]) => ({ id, ...info, meta: COIN_METADATA[id] }))
    .filter(c => c.meta && (c.meta.name.toLowerCase().includes(search.toLowerCase()) || c.meta.ticker.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sort === 'mcap') return b.usd_market_cap - a.usd_market_cap;
      if (sort === 'price') return b.usd - a.usd;
      return b.usd_24h_change - a.usd_24h_change;
    }) : [];

  const portfolioTotal = sortedCoins.reduce((acc, coin) => acc + (holdings[coin.id] || 0) * coin.usd, 0);

  return (
    <>
      <div className="hero-layered">
        <div className="hero-scanline"></div>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ background: 'rgba(40,160,240,0.12)', border: '1px solid rgba(40,160,240,0.3)', padding: '6px 16px', borderRadius: '50px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', color: 'var(--text-primary)', marginBottom: '12px' }}>
              <span className="pulse-dot-live"></span> LIVE
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', background: 'linear-gradient(135deg, #F0F8FF 0%, #28A0F0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Crypto Market Dashboard</h1>
            <p style={{ fontFamily: "'Inter'", fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '10px' }}>Real-time prices powered by CoinGecko API</p>
          </div>
          <div className="glass-card" style={{ display: 'inline-flex', gap: '32px', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Coins Tracked</span>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: '1.1rem', color: 'var(--arb-cyan)' }}>5</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Refresh</span>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: '1.1rem', color: 'var(--arb-cyan)' }}>{timer}s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="market-summary-bar">
        <div className="marquee-track">
          {prices && Object.entries(prices).map(([id, info]) => {
            const meta = COIN_METADATA[id];
            if (!meta) return null;
            const isPos = info.usd_24h_change >= 0;
            return (
              <span key={id} style={{ margin: '0 2rem' }}>
                ⚡ {meta.ticker}: {formatNum(info.usd)} <span style={{ color: isPos ? '#00ff94' : '#ff4560' }}>{isPos ? '▲' : '▼'} {Math.abs(info.usd_24h_change).toFixed(2)}%</span>
              </span>
            );
          })}
          {/* Duplicate for seamless loop */}
          {prices && Object.entries(prices).map(([id, info]) => {
            const meta = COIN_METADATA[id];
            if (!meta) return null;
            const isPos = info.usd_24h_change >= 0;
            return (
              <span key={`${id}-dup`} style={{ margin: '0 2rem' }}>
                ⚡ {meta.ticker}: {formatNum(info.usd)} <span style={{ color: isPos ? '#00ff94' : '#ff4560' }}>{isPos ? '▲' : '▼'} {Math.abs(info.usd_24h_change).toFixed(2)}%</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="controls-row">
        <div className="search-input-wrap">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" className="search-input" placeholder="Search coin..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`pill-toggle ${sort === 'mcap' ? 'active' : ''}`} onClick={() => setSort('mcap')}>Market Cap</button>
          <button className={`pill-toggle ${sort === 'price' ? 'active' : ''}`} onClick={() => setSort('price')}>Price</button>
          <button className={`pill-toggle ${sort === 'change' ? 'active' : ''}`} onClick={() => setSort('change')}>24h Change</button>
        </div>

        <button onClick={fetchPrices} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
          <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i> Refresh
        </button>
      </div>

      {error && (
        <div className="glass-card" style={{ textAlign: 'center', margin: '2rem auto', maxWidth: '500px' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', color: 'var(--arb-red)' }}></i>
          <h3>Connection Failed</h3>
          <p>Unable to reach CoinGecko API. Please try again later.</p>
        </div>
      )}

      <div className="price-grid" style={{ marginBottom: '6rem' }}>
        {loading && !prices ? (
           Array(5).fill(0).map((_, i) => (
            <div key={i} className="card-skeleton">
              <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
              <div className="skeleton-shimmer" style={{ width: '100%', height: '100px', marginTop: '1rem' }}></div>
            </div>
          ))
        ) : (
          sortedCoins.map((coin, index) => (
            <div key={coin.id} className="price-card" style={{ '--glow-blue': `0 0 20px ${coin.usd_24h_change >= 0 ? '#00ff9420' : '#ff456020'}`, order: index + 1 }}>
              <div className="top-accent-bar" style={{ background: coin.meta.color }}></div>
              <div className="card-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={coin.meta.img} style={{ width: '44px', height: '44px', borderRadius: '50%' }} alt={coin.meta.name} />
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'white' }}>{coin.meta.name}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{coin.meta.ticker}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--arb-blue)' }}>#{index + 1}</div>
                </div>
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', color: 'white' }}>{formatNum(coin.usd)}</div>
                  <div style={{ color: coin.usd_24h_change >= 0 ? 'var(--arb-green)' : 'var(--arb-red)', fontWeight: 600 }}>
                    {coin.usd_24h_change >= 0 ? '▲' : '▼'} {Math.abs(coin.usd_24h_change).toFixed(2)}%
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  {coin.sparkline_in_7d && (
                    <Sparkline dataPoints={coin.sparkline_in_7d.price} isPositive={coin.usd_24h_change >= 0} />
                  )}
                </div>

                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Mkt Cap</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{formatNum(coin.usd_market_cap, true, true)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)', paddingLeft: '10px' }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>24h Vol</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{formatNum(coin.usd_24h_vol, true, true)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '10px' }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rank</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>#{index + 1}</span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>My Holdings</label>
                  <input 
                    type="number" 
                    className="portfolio-input" 
                    value={holdings[coin.id] || ''} 
                    placeholder="0.00"
                    onChange={(e) => updateHolding(coin.id, e.target.value)}
                  />
                  <div style={{ fontSize: '0.8rem', color: 'var(--arb-cyan)', marginTop: '6px' }}>
                    ≈ {formatNum((holdings[coin.id] || 0) * coin.usd)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`portfolio-bar ${portfolioTotal > 0 ? 'active' : ''}`}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>💼 Portfolio Value</div>
        <div style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--arb-cyan)' }}>{formatNum(portfolioTotal)}</div>
        <button className="btn btn-danger" style={{ padding: '8px 16px' }} onClick={() => setHoldings({})}>Clear</button>
      </div>
    </>
  );
};

export default Prices;
