import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f0f0f;
    --surface: #1a1a1a;
    --surface2: #242424;
    --border: #2e2e2e;
    --accent: #f0a500;
    --accent-dim: rgba(240,165,0,0.12);
    --accent-glow: rgba(240,165,0,0.25);
    --text: #f0ece4;
    --text-dim: #888;
    --text-faint: #444;
    --green: #3ecf8e;
    --red: #e05c5c;
    --blue: #4fa3d4;
    --radius: 16px;
    --radius-sm: 10px;
  }

  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }

  .app {
    max-width: 420px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }

  /* ---- HEADER ---- */
  .header {
    padding: 52px 24px 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header-title { font-family: 'DM Serif Display', serif; font-size: 26px; line-height: 1.1; }
  .header-sub { font-size: 12px; color: var(--text-dim); margin-top: 3px; letter-spacing: 0.04em; text-transform: uppercase; }
  .header-badge {
    background: var(--accent-dim);
    border: 1px solid var(--accent);
    color: var(--accent);
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    letter-spacing: 0.05em;
  }

  /* ---- CONTENT AREA ---- */
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px 100px;
    scrollbar-width: none;
  }
  .content::-webkit-scrollbar { display: none; }

  /* ---- BOTTOM NAV ---- */
  .nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 420px;
    background: rgba(20,20,20,0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    padding: 12px 8px calc(12px + env(safe-area-inset-bottom));
    z-index: 100;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 6px 4px;
    border-radius: var(--radius-sm);
    transition: all 0.2s;
    border: none;
    background: none;
    color: var(--text-dim);
  }
  .nav-item.active { color: var(--accent); }
  .nav-item svg { width: 22px; height: 22px; }
  .nav-label { font-size: 10px; font-weight: 500; letter-spacing: 0.03em; }
  .nav-scan {
    width: 52px; height: 52px;
    background: var(--accent);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-top: -24px;
    box-shadow: 0 0 24px var(--accent-glow);
    border: none; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    flex-shrink: 0;
  }
  .nav-scan:active { transform: scale(0.93); }
  .nav-scan svg { width: 24px; height: 24px; color: #0f0f0f; }

  /* ---- CARDS ---- */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    margin-bottom: 12px;
  }
  .card-title {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 14px;
    font-weight: 500;
  }

  /* ---- STATS ROW ---- */
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
  .stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 12px;
    text-align: center;
  }
  .stat-num {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: var(--accent);
    line-height: 1;
  }
  .stat-label { font-size: 10px; color: var(--text-dim); margin-top: 4px; letter-spacing: 0.04em; text-transform: uppercase; }

  /* ---- RECEIPT LIST ---- */
  .receipt-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.15s;
  }
  .receipt-item:last-child { border-bottom: none; }
  .receipt-thumb {
    width: 44px; height: 56px;
    background: var(--surface2);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
    border: 1px solid var(--border);
    overflow: hidden;
    position: relative;
  }
  .receipt-thumb::after {
    content: '';
    position: absolute;
    top: 6px; left: 6px; right: 6px;
    height: 2px;
    background: var(--border);
    border-radius: 1px;
  }
  .receipt-info { flex: 1; min-width: 0; }
  .receipt-name { font-size: 14px; font-weight: 500; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .receipt-meta { font-size: 12px; color: var(--text-dim); }
  .receipt-amount { font-family: 'DM Serif Display', serif; font-size: 16px; color: var(--text); }
  .badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .badge-ok { background: rgba(62,207,142,0.12); color: var(--green); }
  .badge-warn { background: rgba(240,165,0,0.12); color: var(--accent); }

  /* ---- SCAN MODAL ---- */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(8px);
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }
  .modal {
    width: 100%;
    max-width: 420px;
    background: var(--surface);
    border-radius: 28px 28px 0 0;
    padding: 28px 24px 40px;
    border-top: 1px solid var(--border);
  }
  .modal-handle {
    width: 36px; height: 4px;
    background: var(--border);
    border-radius: 2px;
    margin: 0 auto 24px;
  }
  .modal-title { font-family: 'DM Serif Display', serif; font-size: 22px; margin-bottom: 6px; }
  .modal-sub { font-size: 13px; color: var(--text-dim); margin-bottom: 24px; }
  .camera-box {
    width: 100%;
    aspect-ratio: 3/4;
    background: var(--bg);
    border-radius: var(--radius);
    border: 2px dashed var(--border);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }
  .camera-corner {
    position: absolute;
    width: 24px; height: 24px;
    border-color: var(--accent);
    border-style: solid;
    border-width: 0;
  }
  .camera-corner.tl { top: 16px; left: 16px; border-top-width: 2px; border-left-width: 2px; }
  .camera-corner.tr { top: 16px; right: 16px; border-top-width: 2px; border-right-width: 2px; }
  .camera-corner.bl { bottom: 16px; left: 16px; border-bottom-width: 2px; border-left-width: 2px; }
  .camera-corner.br { bottom: 16px; right: 16px; border-bottom-width: 2px; border-right-width: 2px; }
  .camera-icon { font-size: 48px; opacity: 0.3; }
  .camera-text { font-size: 13px; color: var(--text-dim); text-align: center; }
  .scan-line {
    position: absolute;
    left: 20px; right: 20px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: scan 2s ease-in-out infinite;
  }
  @keyframes scan {
    0% { top: 20%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 80%; opacity: 0; }
  }

  /* ---- BUTTONS ---- */
  .btn {
    width: 100%;
    padding: 16px;
    border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    letter-spacing: 0.02em;
  }
  .btn-primary { background: var(--accent); color: #0f0f0f; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-ghost {
    background: var(--surface2);
    color: var(--text-dim);
    border: 1px solid var(--border);
    margin-top: 10px;
  }
  .btn-danger { background: rgba(224,92,92,0.12); color: var(--red); border: 1px solid rgba(224,92,92,0.25); margin-top: 10px; }
  .btn-success { background: rgba(62,207,142,0.12); color: var(--green); border: 1px solid rgba(62,207,142,0.25); }

  /* ---- SETTINGS ---- */
  .settings-group { margin-bottom: 8px; }
  .settings-label {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-dim);
    padding: 0 4px;
    margin-bottom: 6px;
  }
  .settings-row {
    display: flex;
    align-items: center;
    padding: 15px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
    gap: 14px;
  }
  .settings-row:first-of-type { border-radius: var(--radius) var(--radius) 0 0; }
  .settings-row:last-of-type { border-radius: 0 0 var(--radius) var(--radius); }
  .settings-row:only-of-type { border-radius: var(--radius); }
  .settings-row + .settings-row { border-top: none; }
  .settings-row:active { background: var(--surface2); }
  .settings-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-size: 16px;
  }
  .settings-text { flex: 1; }
  .settings-name { font-size: 14px; font-weight: 500; }
  .settings-desc { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
  .settings-right { display: flex; align-items: center; gap: 8px; }
  .settings-value { font-size: 13px; color: var(--text-dim); }

  /* ---- TOGGLE ---- */
  .toggle {
    width: 44px; height: 24px;
    background: var(--border);
    border-radius: 12px;
    position: relative;
    transition: background 0.2s;
    cursor: pointer;
    flex-shrink: 0;
    border: none;
  }
  .toggle.on { background: var(--accent); }
  .toggle::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 18px; height: 18px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .toggle.on::after { transform: translateX(20px); }

  /* ---- MONTH PROGRESS ---- */
  .progress-bar {
    height: 6px;
    background: var(--surface2);
    border-radius: 3px;
    margin-top: 10px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #f5c842);
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  /* ---- CHIP ---- */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--accent-dim);
    border: 1px solid var(--accent);
    color: var(--accent);
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    letter-spacing: 0.04em;
  }

  /* ---- MONTH SELECTOR ---- */
  .month-tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    margin-bottom: 16px;
    padding-bottom: 4px;
  }
  .month-tabs::-webkit-scrollbar { display: none; }
  .month-tab {
    flex-shrink: 0;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-dim);
    transition: all 0.15s;
  }
  .month-tab.active {
    background: var(--accent);
    color: #0f0f0f;
    border-color: var(--accent);
  }

  /* ---- INPUT ---- */
  .input-group { margin-bottom: 14px; }
  .input-label { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px; font-weight: 500; }
  .input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 13px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s;
  }
  .input:focus { border-color: var(--accent); }
  .input::placeholder { color: var(--text-faint); }
  select.input { cursor: pointer; }

  /* ---- TOAST ---- */
  .toast {
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    background: var(--green);
    color: #0f0f0f;
    font-size: 13px;
    font-weight: 600;
    padding: 12px 20px;
    border-radius: 40px;
    z-index: 300;
    animation: toastIn 0.3s ease forwards;
    white-space: nowrap;
    max-width: 300px;
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ---- DIVIDER ---- */
  .divider { height: 1px; background: var(--border); margin: 16px 0; }

  /* ---- ANIMATIONS ---- */
  .fade-in { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const RECEIPTS = [
  { id: 1, name: "Albert Heijn", date: "28 apr", amount: "€ 34,80", month: "April", icon: "🛒", ok: true },
  { id: 2, name: "Shell Tankstation", date: "26 apr", amount: "€ 78,50", month: "April", icon: "⛽", ok: true },
  { id: 3, name: "Office Centre", date: "24 apr", amount: "€ 12,99", month: "April", icon: "🖨️", ok: false },
  { id: 4, name: "NS Trein", date: "22 apr", amount: "€ 18,40", month: "April", icon: "🚂", ok: true },
  { id: 5, name: "Bol.com", date: "15 apr", amount: "€ 45,00", month: "April", icon: "📦", ok: true },
  { id: 6, name: "Jumbo", date: "10 mrt", amount: "€ 22,60", month: "Maart", icon: "🛒", ok: true },
  { id: 7, name: "KPN Factuur", date: "01 mrt", amount: "€ 39,95", month: "Maart", icon: "📱", ok: true },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receipts, setReceipts] = useState(RECEIPTS);
  const [toast, setToast] = useState(null);
  const [activeMonth, setActiveMonth] = useState("April");
  const [settings, setSettings] = useState({
    autoDate: true,
    autoCrop: true,
    pdfExport: true,
    cloudSync: false,
    duplicateCheck: true,
    emailBoekhouder: "boekhouder@voorbeeld.nl",
    standaardBericht: "Beste, hierbij de bonnen van deze maand. Met vriendelijke groet,",
    exportFormaat: "pdf",
    maandAfsluiting: "automatisch",
    notificaties: true,
    donkereMode: true,
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const doScan = () => {
    setScanning(true);
    setTimeout(() => {
      const nieuw = {
        id: Date.now(),
        name: "Nieuwe bon",
        date: "28 apr",
        amount: "€ —",
        month: "April",
        icon: "🧾",
        ok: false,
      };
      setReceipts((r) => [nieuw, ...r]);
      setScanning(false);
      setScanOpen(false);
      setTab("archief");
      showToast("✓ Bon gescand en opgeslagen");
    }, 2200);
  };

  const verzendMaand = () => {
    showToast("📤 ZIP verzonden naar boekhouder");
  };

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const months = [...new Set(receipts.map((r) => r.month))];
  const maandBonnen = receipts.filter((r) => r.month === activeMonth);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div>
            <div className="header-title">
              {tab === "home" && "Dashboard"}
              {tab === "archief" && "Archief"}
              {tab === "verzend" && "Verzenden"}
              {tab === "instellingen" && "Instellingen"}
            </div>
            <div className="header-sub">
              {tab === "home" && "April 2026"}
              {tab === "archief" && `${receipts.length} documenten`}
              {tab === "verzend" && "Maand afsluiten"}
              {tab === "instellingen" && "Configuratie"}
            </div>
          </div>
          <div className="header-badge">PRO</div>
        </div>

        {/* Main Content */}
        <div className="content">
          {tab === "home" && <HomeTab receipts={receipts} onScan={() => setScanOpen(true)} onTab={setTab} />}
          {tab === "archief" && (
            <ArchiveTab
              receipts={receipts}
              months={months}
              activeMonth={activeMonth}
              setActiveMonth={setActiveMonth}
              maandBonnen={maandBonnen}
            />
          )}
          {tab === "verzend" && <VerzendTab maandBonnen={maandBonnen} onVerzend={verzendMaand} settings={settings} />}
          {tab === "instellingen" && (
            <SettingsTab settings={settings} toggle={toggle} setSettings={setSettings} showToast={showToast} />
          )}
        </div>

        {/* Bottom Nav */}
        <nav className="nav">
          <button className={`nav-item ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="nav-label">Home</span>
          </button>
          <button className={`nav-item ${tab === "archief" ? "active" : ""}`} onClick={() => setTab("archief")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            <span className="nav-label">Archief</span>
          </button>
          <button className="nav-scan" onClick={() => setScanOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button className={`nav-item ${tab === "verzend" ? "active" : ""}`} onClick={() => setTab("verzend")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span className="nav-label">Verzend</span>
          </button>
          <button
            className={`nav-item ${tab === "instellingen" ? "active" : ""}`}
            onClick={() => setTab("instellingen")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span className="nav-label">Instellingen</span>
          </button>
        </nav>

        {/* Scan Modal */}
        {scanOpen && (
          <ScanModal
            onScan={doScan}
            onClose={() => setScanOpen(false)}
            scanning={scanning}
          />
        )}

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

function ScanModal({ onScan, onClose, scanning }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camError, setCamError] = useState(false);
  const [camReady, setCamReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCamReady(true);
          };
        }
      } catch {
        if (active) setCamError(true);
      }
    }
    startCam();
    return () => {
      active = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleClose = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div className="modal-title" style={{ margin: 0 }}>Bon scannen</div>
          <button
            onClick={handleClose}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 20, color: "var(--text-dim)", fontSize: 12,
              fontWeight: 600, padding: "6px 14px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.03em",
            }}
          >
            Overslaan →
          </button>
        </div>
        <div className="modal-sub">
          {camError ? "Camera niet beschikbaar" : camReady ? "Camera actief — richt op de bon" : "Camera starten…"}
        </div>
        <div className="camera-box" style={{ background: "#000", border: camReady ? "2px solid var(--accent)" : "2px dashed var(--border)" }}>
          <div className="camera-corner tl" />
          <div className="camera-corner tr" />
          <div className="camera-corner bl" />
          <div className="camera-corner br" />
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", borderRadius: "calc(var(--radius) - 2px)",
              opacity: camReady ? 1 : 0, transition: "opacity 0.4s",
            }}
          />
          {scanning && (
            <>
              <div className="scan-line" />
              <div style={{
                position: "absolute", bottom: 16, left: 0, right: 0,
                textAlign: "center", fontSize: 12, color: "var(--accent)", fontWeight: 600,
                background: "rgba(0,0,0,0.6)", padding: "6px 0",
              }}>Verwerken…</div>
            </>
          )}
          {camError && !scanning && (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📵</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Geen toegang tot camera.<br />Controleer de app-instellingen.</div>
            </div>
          )}
          {!camReady && !camError && (
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>⏳ Camera laden…</div>
          )}
        </div>
        {!scanning && (
          <button className="btn btn-primary" onClick={onScan} disabled={camError} style={{ opacity: camError ? 0.4 : 1 }}>
            📸 &nbsp; Foto maken
          </button>
        )}
      </div>
    </div>
  );
}

function HomeTab({ receipts, onScan, onTab }) {
  const maandBonnen = receipts.filter((r) => r.month === "April");
  const totaal = maandBonnen.length;
  const verified = maandBonnen.filter((r) => r.ok).length;
  const progress = Math.round((verified / Math.max(totaal, 1)) * 100);

  return (
    <div className="fade-in">
      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-num">{totaal}</div>
          <div className="stat-label">Bonnen</div>
        </div>
        <div className="stat">
          <div className="stat-num">{verified}</div>
          <div className="stat-label">Verwerkt</div>
        </div>
        <div className="stat">
          <div className="stat-num" style={{ fontSize: 20 }}>€ 190</div>
          <div className="stat-label">Totaal</div>
        </div>
      </div>

      {/* Monthly progress */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div className="card-title" style={{ margin: 0 }}>Maandvoortgang</div>
          <span className="chip">{progress}%</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 2 }}>
          {verified} van {totaal} bonnen verwerkt — April 2026
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Quick send CTA */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(240,165,0,0.08), rgba(240,165,0,0.02))",
          border: "1px solid rgba(240,165,0,0.3)",
          cursor: "pointer",
        }}
        onClick={() => onTab("verzend")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              background: "var(--accent)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            📤
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 3 }}>Maand versturen</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
              Stuur alle bonnen van april naar je boekhouder
            </div>
          </div>
        </div>
      </div>

      {/* Recent receipts */}
      <div className="card">
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}
        >
          <div className="card-title" style={{ margin: 0 }}>Recente bonnen</div>
          <span
            onClick={() => onTab("archief")}
            style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}
          >
            Alles →
          </span>
        </div>
        {receipts.slice(0, 4).map((r) => (
          <ReceiptRow key={r.id} receipt={r} />
        ))}
      </div>
    </div>
  );
}

function ReceiptRow({ receipt: r }) {
  return (
    <div className="receipt-item">
      <div className="receipt-thumb">{r.icon}</div>
      <div className="receipt-info">
        <div className="receipt-name">{r.name}</div>
        <div className="receipt-meta">{r.date} · {r.month}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
        <div className="receipt-amount">{r.amount}</div>
        <span className={`badge ${r.ok ? "badge-ok" : "badge-warn"}`}>{r.ok ? "✓ OK" : "! Check"}</span>
      </div>
    </div>
  );
}

function ArchiveTab({ receipts, months, activeMonth, setActiveMonth, maandBonnen }) {
  return (
    <div className="fade-in">
      <div className="month-tabs">
        {months.map((m) => (
          <button key={m} className={`month-tab ${activeMonth === m ? "active" : ""}`} onClick={() => setActiveMonth(m)}>
            {m}
          </button>
        ))}
      </div>
      <div className="card">
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}
        >
          <div className="card-title" style={{ margin: 0 }}>{activeMonth} 2026</div>
          <span className="chip">{maandBonnen.length} bonnen</span>
        </div>
        {maandBonnen.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-dim)", padding: "28px 0", fontSize: 14 }}>
            Nog geen bonnen in {activeMonth}
          </div>
        ) : (
          maandBonnen.map((r) => <ReceiptRow key={r.id} receipt={r} />)
        )}
      </div>
    </div>
  );
}

function VerzendTab({ maandBonnen, onVerzend, settings }) {
  const verified = maandBonnen.filter((r) => r.ok).length;
  const unverified = maandBonnen.filter((r) => !r.ok).length;

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-title">Overzicht april 2026</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Totaal bonnen", val: maandBonnen.length, color: "var(--text)" },
            { label: "Verwerkt", val: verified, color: "var(--green)" },
            { label: "Nog controleren", val: unverified, color: unverified > 0 ? "var(--accent)" : "var(--text-dim)" },
            { label: "ZIP grootte", val: "~2.4 MB", color: "var(--text-dim)" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 22, fontFamily: "'DM Serif Display', serif", color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Ontvanger</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <div style={{ width: 38, height: 38, background: "rgba(79,163,212,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Boekhouder</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{settings.emailBoekhouder}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Bericht</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, padding: "10px 14px", background: "var(--surface2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          {settings.standaardBericht}<br /><span style={{ color: "var(--accent)" }}>+ 1 bijlage: Bonnen_April_2026.zip</span>
        </div>
      </div>

      {unverified > 0 && (
        <div style={{ background: "rgba(240,165,0,0.07)", border: "1px solid rgba(240,165,0,0.25)", borderRadius: "var(--radius)", padding: "14px 16px", marginBottom: 12, fontSize: 13, color: "var(--accent)" }}>
          ⚠️ &nbsp;{unverified} bon{unverified > 1 ? "nen" : ""} heeft nog een controle nodig. Je kunt toch doorgaan.
        </div>
      )}

      <button className="btn btn-primary" onClick={onVerzend}>
        📤 &nbsp; Verzend maand april
      </button>
      <button className="btn btn-ghost">
        👁 &nbsp; Bekijk ZIP-bestand
      </button>
    </div>
  );
}

function SettingsTab({ settings, toggle, setSettings, showToast }) {
  const set = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const Row = ({ icon, bg, name, desc, right }) => (
    <div className="settings-row">
      <div className="settings-icon" style={{ background: bg }}>{icon}</div>
      <div className="settings-text">
        <div className="settings-name">{name}</div>
        {desc && <div className="settings-desc">{desc}</div>}
      </div>
      <div className="settings-right">{right}</div>
    </div>
  );

  const Toggle = ({ k }) => (
    <button className={`toggle ${settings[k] ? "on" : ""}`} onClick={() => toggle(k)} />
  );

  return (
    <div className="fade-in">
      {/* Boekhouder */}
      <div className="settings-group">
        <div className="settings-label">Boekhouder</div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="input-group">
            <div className="input-label">E-mailadres boekhouder</div>
            <input
              className="input"
              value={settings.emailBoekhouder}
              onChange={(e) => set("emailBoekhouder", e.target.value)}
              placeholder="naam@boekhouder.nl"
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <div className="input-label">Standaard bericht</div>
            <textarea
              className="input"
              style={{ resize: "none", minHeight: 80 }}
              value={settings.standaardBericht}
              onChange={(e) => set("standaardBericht", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Scan instellingen */}
      <div className="settings-group">
        <div className="settings-label">Scannen & herkenning</div>
        <Row icon="📅" bg="rgba(240,165,0,0.12)" name="Automatische datumherkenning" desc="OCR leest datum van de bon" right={<Toggle k="autoDate" />} />
        <Row icon="✂️" bg="rgba(79,163,212,0.12)" name="Automatisch bijsnijden" desc="Randen en perspectief corrigeren" right={<Toggle k="autoCrop" />} />
        <Row icon="🔍" bg="rgba(62,207,142,0.12)" name="Duplicaatdetectie" desc="Voorkomt dubbele bonnen" right={<Toggle k="duplicateCheck" />} />
      </div>

      {/* Export */}
      <div className="settings-group">
        <div className="settings-label">Export & verzending</div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="input-group">
            <div className="input-label">Exportformaat</div>
            <select className="input" value={settings.exportFormaat} onChange={(e) => set("exportFormaat", e.target.value)}>
              <option value="pdf">PDF (aanbevolen)</option>
              <option value="jpg">JPEG afbeelding</option>
              <option value="png">PNG afbeelding</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <div className="input-label">Maandafsluiting</div>
            <select className="input" value={settings.maandAfsluiting} onChange={(e) => set("maandAfsluiting", e.target.value)}>
              <option value="automatisch">Automatisch (1e van de maand)</option>
              <option value="handmatig">Handmatig</option>
              <option value="herinnering">Herinnering sturen</option>
            </select>
          </div>
        </div>
        <Row icon="☁️" bg="rgba(79,163,212,0.12)" name="Cloud synchronisatie" desc="Sync met Google Drive / iCloud" right={<Toggle k="cloudSync" />} />
        <Row icon="📄" bg="rgba(240,165,0,0.12)" name="PDF-export" desc="Sla alles op als PDF" right={<Toggle k="pdfExport" />} />
      </div>

      {/* App */}
      <div className="settings-group">
        <div className="settings-label">Applicatie</div>
        <Row icon="🔔" bg="rgba(224,92,92,0.12)" name="Notificaties" desc="Herinneringen en updates" right={<Toggle k="notificaties" />} />
        <Row icon="🌙" bg="rgba(100,100,130,0.2)" name="Donkere modus" desc="Momenteel actief" right={<Toggle k="donkereMode" />} />
        <Row icon="ℹ️" bg="rgba(62,207,142,0.1)" name="Versie" desc="BonnenApp Pro 1.0" right={<span style={{ fontSize: 12, color: "var(--text-dim)" }}>1.0.0</span>} />
      </div>

      <button className="btn btn-success" onClick={() => showToast("✓ Instellingen opgeslagen")}>
        ✓ &nbsp; Instellingen opslaan
      </button>
      <button className="btn btn-danger" onClick={() => showToast("🗑 Alle data verwijderd")}>
        🗑 &nbsp; Alle gegevens wissen
      </button>
    </div>
  );
}
