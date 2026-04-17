import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState('en');

  // Canvas Refs
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapSvgRef = useRef<SVGSVGElement>(null);

  // --- Hero Animation ---
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let tgt = { ...mouse };

    let animationFrame: number;
    const waves = [
      { offset: 0, amplitude: 72, frequency: 0.003, color: '#0EA5E9', opacity: 0.45 },
      { offset: Math.PI / 2, amplitude: 95, frequency: 0.0026, color: '#38BDF8', opacity: 0.35 },
      { offset: Math.PI, amplitude: 58, frequency: 0.0034, color: '#7DD3FC', opacity: 0.28 },
      { offset: Math.PI * 1.5, amplitude: 82, frequency: 0.0022, color: '#BAE6FD', opacity: 0.20 }
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      time++;
      mouse.x += (tgt.x - mouse.x) * 0.1;
      mouse.y += (tgt.y - mouse.y) * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, '#0F172A'); g.addColorStop(1, '#080E1A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      waves.forEach(w => {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 4) {
          const dx = x - mouse.x, dy = canvas.height / 2 - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const inf = Math.max(0, 1 - dist / 320);
          const me = inf * 68 * Math.sin(time * 0.001 + x * 0.01 + w.offset);
          const y = canvas.height / 2 + Math.sin(x * w.frequency + time * 0.02 + w.offset) * w.amplitude + me;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineWidth = 2.5; ctx.strokeStyle = w.color; ctx.globalAlpha = w.opacity;
        ctx.stroke(); ctx.restore();
      });
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => { tgt.x = e.clientX; tgt.y = e.clientY; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resize);
    resize();
    animate();
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // --- Radar Animation ---
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let sweepAngle = 0;
    let currentClosest: string | null = null;
    let animationFrame: number;

    const draw = () => {
      const sz = canvas.width;
      const cx = sz / 2, cy = sz / 2;
      ctx.clearRect(0, 0, sz, sz);
      
      // Draw circles
      [0.12, 0.28, 0.44].forEach(rf => {
        ctx.beginPath(); ctx.arc(cx, cy, sz * rf, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(71,85,105,0.3)'; ctx.stroke();
      });

      // Draw sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweepAngle);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 0.45);
      grad.addColorStop(0, 'rgba(14,165,233,0.2)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, sz * 0.45, -0.5, 0); ctx.fill();
      ctx.restore();

      // Highlight closest logic
      const norm = (a: number) => ((a % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      let best = 0.14;
      categories.forEach(cat => {
        const angle = Math.atan2(parseFloat(cat.top) - 50, parseFloat(cat.left) - 50);
        const diff = Math.min(Math.abs(norm(sweepAngle) - norm(angle)), (Math.PI * 2) - Math.abs(norm(sweepAngle) - norm(angle)));
        if (diff < best) {
          setSelectedCategory(cat.id);
        }
      });

      sweepAngle += 0.01;
      animationFrame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetWidth;
      }
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // --- World Map Animation ---
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLand = (lat: number, lng: number) => {
      if (lat > 35  && lat < 72  && lng > -24  && lng < 50)  return true;
      if (lat > -37 && lat < 38  && lng > -18  && lng < 55)  return true;
      if (lat > -5  && lat < 78  && lng > 25   && lng < 150) return true;
      return false;
    };

    const drawDots = () => {
      const w = canvas.width = canvas.offsetWidth || 960;
      const h = canvas.height = canvas.offsetHeight || 400;
      ctx.clearRect(0, 0, w, h);
      const cols = 150, rows = 70, cw = w / cols, ch = h / rows;
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const lng = (col / cols) * 360 - 180, lat = 90 - (row / rows) * 180;
          if (isLand(lat, lng)) {
            ctx.beginPath(); ctx.arc((col + 0.5) * cw, (row + 0.5) * ch, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
          }
        }
      }
    };

    window.addEventListener('resize', drawDots);
    drawDots();
    return () => window.removeEventListener('resize', drawDots);
  }, []);

  const categories = [
    { id: 'barbershop', icon: '💈', name: 'Barbershop', top: '15%', left: '25%' },
    { id: 'beauty', icon: '💅', name: 'Beauty', top: '15%', left: '75%' },
    { id: 'hospital', icon: '🏥', name: 'Hospital', top: '50%', left: '5%' },
    { id: 'bank', icon: '🏦', name: 'Bank', top: '50%', left: '95%' },
    { id: 'government', icon: '🏛️', name: 'Gov', top: '85%', left: '25%' },
    { id: 'transport', icon: '🚕', name: 'Transport', top: '85%', left: '75%' },
    { id: 'hotel', icon: '🏨', name: 'Hotels', top: '30%', left: '10%' },
    { id: 'repair', icon: '🔧', name: 'Repair', top: '30%', left: '90%' },
  ];

  const categoryTitles: Record<string, string> = {
    barbershop: 'Barbershop Services',
    beauty: 'Beauty Salon Services',
    hospital: 'Medical Facilities',
    bank: 'Financial Services',
    government: 'Government Offices',
    transport: 'Transport & Logistics'
  };

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#" className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Q LINK
          </a>
          <ul className="nav-links">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#providers">Providers</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className={`btn ${activeLang === 'en' ? 'btn-primary' : ''}`} onClick={() => setActiveLang('en')}>ENG</button>
            <button className={`btn ${activeLang === 'sw' ? 'btn-primary' : ''}`} onClick={() => setActiveLang('sw')}>SWA</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <canvas id="heroCanvas" ref={heroCanvasRef} />
        <div className="hero-inner animate-fade-up">
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '20px', display: 'inline-block', color: 'white', fontSize: '12px', marginBottom: '20px' }}>
            THE GLOBAL SERVICE BOOKING PLATFORM
          </div>
          <h1>Book Trusted Services<br/><span className="hero-grad">Anywhere in the World</span></h1>
          <p className="hero-sub">Find and book verified service providers near you — barbershops, hospitals, banks, and more, all on one trusted platform.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ borderRadius: '30px' }}>Get Started</button>
            <button className="btn btn-secondary" style={{ borderRadius: '30px', background: 'transparent', color: 'white', border: '1px solid white' }}>Become a Provider</button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '40px' }}>How It Works</h2>
          <div className="hiw-track">
            <div className="hiw-step">
              <div className="hiw-num active">🔍</div>
              <h3>Choose Service</h3>
              <p>Select from 11+ categories near you</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num active">👤</div>
              <h3>Select Provider</h3>
              <p>Browse verified providers with ratings</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">📅</div>
              <h3>Pick a Time</h3>
              <p>Choose your preferred date & slot</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">✅</div>
              <h3>Get Served</h3>
              <p>Scan QR code and receive your service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Radar Services */}
      <section className="radar-section" id="services">
        <h2 style={{ color: 'white', marginBottom: '10px' }}>Our Services</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Everything you need, detected and ready to book</p>
        <div className="radar-stage">
          <canvas id="radarCanvas" ref={radarCanvasRef} />
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className="rn lit" 
              style={{ top: cat.top, left: cat.left }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <div className="rn-box">{cat.icon}</div>
              <div style={{ fontSize: '11px', color: '#38BDF8', marginTop: '4px' }}>{cat.name}</div>
            </div>
          ))}
          <div className="radar-info">
            <div style={{ fontSize: '30px' }}>🎯</div>
            <div style={{ color: '#38BDF8', fontWeight: 800 }}>Q LINK</div>
          </div>
        </div>
      </section>

      {/* Providers Bento Grid */}
      <section className="providers-section" id="providers">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Grow Your Business with Q LINK</h2>
          <p>Join thousands of verified professionals worldwide.</p>
        </div>
        <div className="bento-grid">
          <div className="bento-card bento-col-2">
            <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--primary)' }}>100%</div>
            <h3 style={{ color: 'var(--text-primary)' }}>Your Schedule</h3>
            <p>Full control over your availability and time slots.</p>
          </div>
          <div className="bento-card bento-col-2" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>🛡️</div>
            <h3 style={{ color: 'var(--text-primary)' }}>Verified by Default</h3>
            <p>Every provider passes identity and business verification.</p>
          </div>
          <div className="bento-card bento-col-2">
            <h3 style={{ color: 'var(--text-primary)' }}>Secure Payouts</h3>
            <p>Accept M-Pesa, cards, and wallets globally.</p>
          </div>
          <div className="bento-card bento-col-3">
            <h3 style={{ color: 'var(--text-primary)' }}>Global Payouts</h3>
            <div style={{ marginTop: '15px' }}>
              <div style={{ background: '#eee', height: '8px', borderRadius: '4px', marginBottom: '10px' }}>
                <div style={{ background: 'var(--primary)', width: '82%', height: '100%', borderRadius: '4px' }} />
              </div>
              <span>M-Pesa (82%)</span>
            </div>
          </div>
          <div className="bento-card bento-col-3">
            <h3 style={{ color: 'var(--text-primary)' }}>Provider Community</h3>
            <p>Connect with professionals across Nairobi, Lagos, and Accra.</p>
          </div>
        </div>
      </section>

      {/* World Map */}
      <section className="map-section">
        <h2 style={{ color: 'white' }}>Built for the World</h2>
        <div className="world-map-wrap">
          <canvas id="dottedMapCanvas" ref={mapCanvasRef} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* Map connections could be animated here */}
          </svg>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '20px' }}>Live across Africa · Expanding Globally</p>
      </section>

      {/* FAQ Section */}
      <section className="section" id="faq" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
          {[
            { q: "How do I book a service?", a: "Download the Q LINK app, select category, choose provider, and confirm your time." },
            { q: "Is Q LINK free to use?", a: "Yes, it's free for customers. Providers pay a small commission on completed bookings." },
            { q: "How are payments handled?", a: "Payments are secured through encrypted M-Pesa integration." }
          ].map((item, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', background: 'none', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                {item.q} <span>{activeFaq === i ? '−' : '+'}</span>
              </button>
              {activeFaq === i && <p style={{ marginTop: '10px', fontSize: '15px' }}>{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--secondary)', color: 'white', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          <div>
            <div className="logo" style={{ color: 'white' }}>Q LINK</div>
            <p style={{ opacity: 0.7, marginTop: '15px' }}>The world's trusted service booking platform.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul style={{ listStyle: 'none', marginTop: '15px', opacity: 0.7 }}>
              <li>How It Works</li>
              <li>Services</li>
              <li>Providers</li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul style={{ listStyle: 'none', marginTop: '15px', opacity: 0.7 }}>
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '40px auto 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.5 }}>
          © 2024 Q LINK. All rights reserved.
        </div>
      </footer>

      {/* Category Modal */}
      {selectedCategory && (
        <div className="modal-overlay" onClick={() => setSelectedCategory(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedCategory(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>{selectedCategory.toUpperCase()} Providers</h3>
            <div className="providers-grid">
              <div className="provider-card">
                <div style={{ fontWeight: 600 }}>Fresh Cuts Barbershop</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nairobi</div>
                <div style={{ color: 'var(--warning)', margin: '8px 0' }}>★★★★★ 4.8</div>
                <button className="btn btn-primary btn-full">Book Now</button>
              </div>
              <div className="provider-card">
                <div style={{ fontWeight: 600 }}>Elite Professionals</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Mombasa</div>
                <div style={{ color: 'var(--warning)', margin: '8px 0' }}>★★★★☆ 4.5</div>
                <button className="btn btn-primary btn-full">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;