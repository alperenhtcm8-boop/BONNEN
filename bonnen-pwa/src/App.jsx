import { useEffect, useRef, useState } from "react";

const styles = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f0f0f;color:#f0ece4;font-family:Arial,sans-serif}
button,input,textarea{font-family:inherit}
.app{max-width:420px;margin:0 auto;min-height:100vh;background:#0f0f0f;padding-bottom:95px}
.header{padding:45px 22px 18px;display:flex;justify-content:space-between}
.title{font-size:28px;font-weight:800}
.sub{font-size:12px;color:#999;margin-top:4px}
.badge{background:#2b2108;color:#f0a500;border:1px solid #f0a500;border-radius:20px;padding:5px 10px;font-size:11px}
.content{padding:0 18px}
.card{background:#1a1a1a;border:1px solid #303030;border-radius:18px;padding:16px;margin-bottom:12px}
.cardTitle{font-size:12px;color:#999;text-transform:uppercase;margin-bottom:12px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}
.stat{background:#1a1a1a;border:1px solid #303030;border-radius:16px;padding:14px;text-align:center}
.stat strong{display:block;color:#f0a500;font-size:24px}
.stat span{font-size:10px;color:#999;text-transform:uppercase}
.receipt{display:flex;gap:12px;align-items:center;padding:13px 0;border-bottom:1px solid #303030;cursor:pointer;min-height:74px}
.receipt:last-child{border-bottom:0}
.thumb{width:48px;height:60px;border-radius:10px;background:#252525;border:1px solid #333;object-fit:cover;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.info{flex:1;min-width:0}
.name{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.meta{font-size:12px;color:#999;margin-top:4px}
.amount{font-size:16px;font-weight:800}
.check{font-size:10px;margin-top:4px;padding:3px 8px;border-radius:20px;text-align:center}
.ok{background:#103524;color:#3ecf8e}
.warn{background:#332508;color:#f0a500}
.nav{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:100%;max-width:420px;background:#151515;border-top:1px solid #303030;display:flex;padding:10px 8px calc(10px + env(safe-area-inset-bottom));z-index:50}
.nav button{flex:1;background:none;border:0;color:#999;padding:8px 2px;font-size:11px;cursor:pointer}
.nav button.active{color:#f0a500}
.scanBtn{width:58px!important;height:58px!important;flex:none!important;border-radius:50%!important;background:#f0a500!important;color:#111!important;margin-top:-25px;font-size:25px!important;font-weight:900;box-shadow:0 0 25px rgba(240,165,0,.35)}
.btn{width:100%;border:0;border-radius:16px;padding:16px;font-size:15px;font-weight:800;margin-top:10px;cursor:pointer}
.primary{background:#f0a500;color:#111}
.ghost{background:#252525;color:#ddd;border:1px solid #333}
.danger{background:#351b1b;color:#ff7777;border:1px solid #6b2a2a}
.success{background:#103524;color:#3ecf8e;border:1px solid #236c4c}
.input{width:100%;background:#252525;color:#fff;border:1px solid #333;border-radius:12px;padding:13px;margin-top:6px;margin-bottom:12px;font-size:15px}
label{font-size:11px;text-transform:uppercase;color:#999}
.modalOverlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:100;display:flex;align-items:flex-end;justify-content:center}
.modal{width:100%;max-width:420px;background:#1a1a1a;border-radius:28px 28px 0 0;padding:22px;border-top:1px solid #333;max-height:92vh;overflow:auto}
.modalTop{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.modalTitle{font-size:24px;font-weight:900}
.close{background:#252525;border:1px solid #333;color:#ddd;border-radius:20px;padding:8px 12px}
.cameraBox{width:100%;aspect-ratio:3/4;background:#000;border-radius:18px;overflow:hidden;margin:12px 0;position:relative;border:2px solid #f0a500}
video{width:100%;height:100%;object-fit:cover}
.preview{width:100%;border-radius:16px;margin-bottom:14px;max-height:380px;object-fit:contain;background:#000}
.empty{text-align:center;color:#999;padding:30px 0}
.months{display:flex;gap:8px;overflow:auto;margin-bottom:12px}
.months button{border:1px solid #333;background:#1a1a1a;color:#999;border-radius:20px;padding:8px 15px;white-space:nowrap}
.months .active{background:#f0a500;color:#111;border-color:#f0a500}
.toast{position:fixed;bottom:95px;left:50%;transform:translateX(-50%);background:#3ecf8e;color:#111;padding:12px 18px;border-radius:30px;font-weight:800;z-index:200}
`;

const DEMO = [
  { id: 1, name: "Albert Heijn", date: "28 apr", amount: "€ 34,80", month: "April", ok: true, image: "", note: "" },
  { id: 2, name: "Shell Tankstation", date: "26 apr", amount: "€ 78,50", month: "April", ok: true, image: "", note: "" },
  { id: 3, name: "Office Centre", date: "24 apr", amount: "€ 12,99", month: "April", ok: false, image: "", note: "" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem("bonnenapp_receipts");
    return saved ? JSON.parse(saved) : DEMO;
  });
  const [scanOpen, setScanOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [toast, setToast] = useState("");
  const [month, setMonth] = useState("April");
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("bonnenapp_settings");
    return saved
      ? JSON.parse(saved)
      : { email: "boekhouder@voorbeeld.nl", bericht: "Beste, hierbij mijn bonnen van deze maand." };
  });

  useEffect(() => localStorage.setItem("bonnenapp_receipts", JSON.stringify(receipts)), [receipts]);
  useEffect(() => localStorage.setItem("bonnenapp_settings", JSON.stringify(settings)), [settings]);

  const msg = (t) => {
    setToast(t);
    setTimeout(() => setToast(""), 2200);
  };

  const currentMonthReceipts = receipts.filter((r) => r.month === month);
  const checked = currentMonthReceipts.filter((r) => r.ok).length;
  const totalAmount = currentMonthReceipts.reduce((sum, r) => {
    const n = parseFloat(String(r.amount).replace("€", "").replace(",", ".").replace(/[^\d.]/g, ""));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const saveReceipt = () => {
    const fixed = {
      ...edit,
      name: edit.name?.trim() || "Onbekende bon",
      amount: edit.amount?.startsWith("€") ? edit.amount : `€ ${edit.amount || "—"}`,
      ok: true,
    };
    setReceipts((prev) => {
      const exists = prev.some((r) => r.id === fixed.id);
      return exists ? prev.map((r) => (r.id === fixed.id ? fixed : r)) : [fixed, ...prev];
    });
    setEdit(null);
    setTab("archief");
    msg("✓ Bon bevestigd en opgeslagen");
  };

  const deleteReceipt = () => {
    if (edit?.id) setReceipts((prev) => prev.filter((r) => r.id !== edit.id));
    setEdit(null);
    msg("Bon verwijderd");
  };

  const onPhoto = (image) => {
    const now = new Date();
    const newReceipt = {
      id: Date.now(),
      name: "Nieuwe bon",
      date: now.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" }),
      amount: "",
      month: now.toLocaleDateString("nl-NL", { month: "long" }).replace(/^./, (c) => c.toUpperCase()),
      ok: false,
      image,
      note: "",
    };
    setScanOpen(false);
    setEdit(newReceipt);
  };

  const months = [...new Set(receipts.map((r) => r.month))];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="title">
              {tab === "home" && "Dashboard"}
              {tab === "archief" && "Bonnen"}
              {tab === "verzend" && "Verzenden"}
              {tab === "settings" && "Instellingen"}
            </div>
            <div className="sub">BonnenApp MVP</div>
          </div>
          <div className="badge">PRO</div>
        </div>

        <div className="content">
          {tab === "home" && (
            <>
              <div className="stats">
                <div className="stat"><strong>{currentMonthReceipts.length}</strong><span>Bonnen</span></div>
                <div className="stat"><strong>{checked}</strong><span>Gecheckt</span></div>
                <div className="stat"><strong>€{totalAmount.toFixed(0)}</strong><span>Totaal</span></div>
              </div>

              <div className="card" onClick={() => setScanOpen(true)} style={{ cursor: "pointer", borderColor: "#f0a500" }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>📸 Bon scannen</div>
                <div className="sub">Maak foto → controleer → bevestig</div>
              </div>

              <div className="card">
                <div className="cardTitle">Nog controleren</div>
                {receipts.filter((r) => !r.ok).length === 0 ? (
                  <div className="empty">Alles is gecontroleerd.</div>
                ) : (
                  receipts.filter((r) => !r.ok).map((r) => <Receipt key={r.id} r={r} onClick={() => setEdit(r)} />)
                )}
              </div>

              <div className="card">
                <div className="cardTitle">Laatste bonnen</div>
                {receipts.slice(0, 4).map((r) => <Receipt key={r.id} r={r} onClick={() => setEdit(r)} />)}
              </div>
            </>
          )}

          {tab === "archief" && (
            <>
              <div className="months">
                {months.map((m) => (
                  <button key={m} onClick={() => setMonth(m)} className={month === m ? "active" : ""}>{m}</button>
                ))}
              </div>
              <div className="card">
                <div className="cardTitle">{month}</div>
                {currentMonthReceipts.length === 0 ? (
                  <div className="empty">Geen bonnen.</div>
                ) : (
                  currentMonthReceipts.map((r) => <Receipt key={r.id} r={r} onClick={() => setEdit(r)} />)
                )}
              </div>
            </>
          )}

          {tab === "verzend" && (
            <>
              <div className="card">
                <div className="cardTitle">Maandcontrole</div>
                <p>{currentMonthReceipts.length} bonnen in {month}</p>
                <p style={{ color: "#f0a500", marginTop: 8 }}>{currentMonthReceipts.length - checked} nog controleren</p>
              </div>
              <div className="card">
                <div className="cardTitle">Boekhouder</div>
                <p>{settings.email}</p>
              </div>
              <button className="btn primary" onClick={() => msg("📤 Verzenden komt in volgende versie")}>📤 Maand verzenden</button>
              <button className="btn ghost" onClick={() => setTab("archief")}>Controleer bonnen</button>
            </>
          )}

          {tab === "settings" && (
            <>
              <div className="card">
                <label>E-mailadres boekhouder</label>
                <input className="input" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                <label>Standaard bericht</label>
                <textarea className="input" rows="4" value={settings.bericht} onChange={(e) => setSettings({ ...settings, bericht: e.target.value })} />
              </div>
              <button className="btn success" onClick={() => msg("✓ Instellingen opgeslagen")}>Opslaan</button>
              <button className="btn danger" onClick={() => { localStorage.clear(); setReceipts([]); msg("Alle data gewist"); }}>Alle gegevens wissen</button>
            </>
          )}
        </div>

        <div className="nav">
          <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}>⌂<br />Home</button>
          <button className={tab === "archief" ? "active" : ""} onClick={() => setTab("archief")}>▤<br />Bonnen</button>
          <button className="scanBtn" onClick={() => setScanOpen(true)}>+</button>
          <button className={tab === "verzend" ? "active" : ""} onClick={() => setTab("verzend")}>↗<br />Verzend</button>
          <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>⚙<br />Instel</button>
        </div>

        {scanOpen && <ScanModal onClose={() => setScanOpen(false)} onPhoto={onPhoto} />}
        {edit && <EditModal receipt={edit} setReceipt={setEdit} onSave={saveReceipt} onDelete={deleteReceipt} />}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

function Receipt({ r, onClick }) {
  return (
    <div className="receipt" onClick={onClick}>
      {r.image ? <img className="thumb" src={r.image} /> : <div className="thumb">🧾</div>}
      <div className="info">
        <div className="name">{r.name}</div>
        <div className="meta">{r.date} · {r.month}</div>
      </div>
      <div>
        <div className="amount">{r.amount || "€ —"}</div>
        <div className={`check ${r.ok ? "ok" : "warn"}`}>{r.ok ? "✓ OK" : "! Check"}</div>
      </div>
    </div>
  );
}

function ScanModal({ onClose, onPhoto }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(() => setError("Camera niet toegestaan. Controleer Safari camera-toegang."));
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const takePhoto = () => {
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 900;
    canvas.height = v.videoHeight || 1200;
    canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onPhoto(canvas.toDataURL("image/jpeg", 0.82));
  };

  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalTop">
          <div className="modalTitle">Bon scannen</div>
          <button className="close" onClick={onClose}>Overslaan</button>
        </div>
        <div className="cameraBox">
          {error ? <div className="empty">{error}</div> : <video ref={videoRef} playsInline muted />}
        </div>
        <button className="btn primary" onClick={takePhoto} disabled={!!error}>📸 Foto maken</button>
        <button className="btn ghost" onClick={onClose}>Annuleren</button>
      </div>
    </div>
  );
}

function EditModal({ receipt, setReceipt, onSave, onDelete }) {
  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalTop">
          <div className="modalTitle">Controleer bon</div>
          <button className="close" onClick={() => setReceipt(null)}>Sluiten</button>
        </div>

        {receipt.image && <img className="preview" src={receipt.image} />}

        <label>Winkel / omschrijving</label>
        <input className="input" value={receipt.name} onChange={(e) => setReceipt({ ...receipt, name: e.target.value })} />

        <label>Datum</label>
        <input className="input" value={receipt.date} onChange={(e) => setReceipt({ ...receipt, date: e.target.value })} />

        <label>Bedrag</label>
        <input className="input" inputMode="decimal" placeholder="Bijv. 34,80" value={receipt.amount} onChange={(e) => setReceipt({ ...receipt, amount: e.target.value })} />

        <label>Maand</label>
        <input className="input" value={receipt.month} onChange={(e) => setReceipt({ ...receipt, month: e.target.value })} />

        <label>Notitie</label>
        <textarea className="input" rows="3" value={receipt.note || ""} onChange={(e) => setReceipt({ ...receipt, note: e.target.value })} />

        <button className="btn success" onClick={onSave}>✓ Bevestigen en opslaan</button>
        <button className="btn danger" onClick={onDelete}>🗑 Verwijderen</button>
      </div>
    </div>
  );
}
