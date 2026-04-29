import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import JSZip from "jszip";

const styles = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{background:#0f0f0f;color:#f0ece4;font-family:Arial,sans-serif}
button,input,textarea{font-family:inherit;font-size:16px}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:#0f0f0f;padding-bottom:98px}
.header{padding:48px 22px 18px;display:flex;justify-content:space-between;align-items:flex-start}
.title{font-size:28px;font-weight:900}
.sub{font-size:12px;color:#999;margin-top:4px}
.badge{background:#2b2108;color:#f0a500;border:1px solid #f0a500;border-radius:20px;padding:5px 10px;font-size:11px}
.content{padding:0 18px}
.card{background:#1a1a1a;border:1px solid #303030;border-radius:18px;padding:16px;margin-bottom:12px}
.cardTitle{font-size:12px;color:#999;text-transform:uppercase;margin-bottom:12px}
.bigScan{border-color:#f0a500;cursor:pointer}
.bigScan div:first-child{font-size:21px;font-weight:900}
.receipt{display:flex;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #303030;cursor:pointer;min-height:78px}
.receipt:last-child{border-bottom:0}
.thumb{width:52px;height:64px;border-radius:10px;background:#252525;border:1px solid #333;object-fit:cover;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.info{flex:1;min-width:0}
.name{font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.meta{font-size:12px;color:#999;margin-top:4px}
.amount{font-size:16px;font-weight:900}
.check{font-size:10px;margin-top:4px;padding:3px 8px;border-radius:20px;text-align:center}
.ok{background:#103524;color:#3ecf8e}
.warn{background:#332508;color:#f0a500}
.nav{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:100%;max-width:430px;background:#151515;border-top:1px solid #303030;display:flex;padding:10px 8px calc(10px + env(safe-area-inset-bottom));z-index:50}
.nav button{flex:1;background:none;border:0;color:#999;padding:8px 2px;font-size:11px;cursor:pointer}
.nav .active{color:#f0a500}
.scanBtn{width:58px!important;height:58px!important;flex:none!important;border-radius:50%!important;background:#f0a500!important;color:#111!important;margin-top:-25px;font-size:28px!important;font-weight:900;box-shadow:0 0 25px rgba(240,165,0,.35)}
.btn{width:100%;border:0;border-radius:16px;padding:15px;font-size:15px;font-weight:900;margin-top:10px;cursor:pointer}
.primary{background:#f0a500;color:#111}
.ghost{background:#252525;color:#ddd;border:1px solid #333}
.danger{background:#351b1b;color:#ff7777;border:1px solid #6b2a2a}
.success{background:#103524;color:#3ecf8e;border:1px solid #236c4c}
.input{width:100%;background:#252525;color:#fff;border:1px solid #333;border-radius:12px;padding:12px;margin-top:5px;margin-bottom:10px}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
label{font-size:10px;text-transform:uppercase;color:#999;font-weight:800}
.modalOverlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:100;display:flex;align-items:flex-end;justify-content:center}
.modal{width:100%;max-width:430px;background:#1a1a1a;border-radius:26px 26px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));border-top:1px solid #333;max-height:94vh;overflow:auto}
.modalTop{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.modalTitle{font-size:23px;font-weight:900}
.close{background:#252525;border:1px solid #333;color:#ddd;border-radius:20px;padding:8px 12px}
.cameraBox{width:100%;aspect-ratio:3/4;background:#000;border-radius:18px;overflow:hidden;margin:10px 0;position:relative;border:2px solid #f0a500}
video{width:100%;height:100%;object-fit:cover}
.preview{width:100%;border-radius:14px;max-height:220px;object-fit:contain;background:#000;margin-bottom:10px}
.empty{text-align:center;color:#999;padding:26px 0}
.months{display:flex;gap:8px;overflow:auto;margin-bottom:12px}
.months button{border:1px solid #333;background:#1a1a1a;color:#999;border-radius:20px;padding:8px 15px;white-space:nowrap}
.months .active{background:#f0a500;color:#111;border-color:#f0a500}
.toast{position:fixed;bottom:96px;left:50%;transform:translateX(-50%);background:#3ecf8e;color:#111;padding:12px 18px;border-radius:30px;font-weight:900;z-index:200;max-width:92%;text-align:center}
.small{font-size:12px;color:#999;line-height:1.45}
.ocr{font-size:12px;color:#f0a500;margin:7px 0}
.actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
`;

export default function App() {
  const [tab, setTab] = useState("home");
  const [receipts, setReceipts] = useState(() =>
    JSON.parse(localStorage.getItem("bonnenapp_receipts") || "[]")
  );
  const [settings, setSettings] = useState(() =>
    JSON.parse(
      localStorage.getItem("bonnenapp_settings") ||
        '{"email":"boekhouder@voorbeeld.nl","bericht":"Beste, hierbij mijn bonnen van deze maand."}'
    )
  );
  const [scanOpen, setScanOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [toast, setToast] = useState("");
  const [month, setMonth] = useState(
    new Date()
      .toLocaleDateString("nl-NL", { month: "long" })
      .replace(/^./, (c) => c.toUpperCase())
  );
  const [sending, setSending] = useState(false);

  useEffect(() => {
    localStorage.setItem("bonnenapp_receipts", JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem("bonnenapp_settings", JSON.stringify(settings));
  }, [settings]);

  const msg = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  };

  const months = [...new Set([month, ...receipts.map((r) => r.month)])];
  const current = receipts.filter((r) => r.month === month);
  const unchecked = receipts.filter((r) => !r.ok);

  const saveReceipt = () => {
    const fixed = {
      ...edit,
      name: edit.name?.trim() || "Onbekende bon",
      amount: edit.amount?.trim() || "",
      ok: true,
    };

    setReceipts((prev) =>
      prev.some((r) => r.id === fixed.id)
        ? prev.map((r) => (r.id === fixed.id ? fixed : r))
        : [fixed, ...prev]
    );

    setEdit(null);
    setTab("archief");
    msg("✓ Bon bevestigd en opgeslagen");
  };

  const deleteReceipt = () => {
    if (edit?.id) {
      setReceipts((prev) => prev.filter((r) => r.id !== edit.id));
    }
    setEdit(null);
    msg("Bon verwijderd");
  };

  const retake = () => {
    setEdit(null);
    setScanOpen(true);
  };

  const onPhoto = (image) => {
    const now = new Date();

    setScanOpen(false);
    setEdit({
      id: Date.now(),
      image,
      name: "",
      amount: "",
      date: now.toLocaleDateString("nl-NL", {
        day: "2-digit",
        month: "short",
      }),
      month: now
        .toLocaleDateString("nl-NL", { month: "long" })
        .replace(/^./, (c) => c.toUpperCase()),
      ok: false,
      note: "",
      ocrText: "",
      ocrBusy: true,
    });

    runOCR(image);
  };

  const runOCR = async (image) => {
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(image, "eng");

      const parsed = parseReceiptText(text);

      setEdit((prev) =>
        prev ? { ...prev, ...parsed, ocrText: text, ocrBusy: false } : prev
      );
    } catch {
      setEdit((prev) => (prev ? { ...prev, ocrBusy: false } : prev));
    }
  };

  const sendMonth = async () => {
    setSending(true);

    try {
      const zip = new JSZip();
      const rows = [["datum", "bedrijf", "bedrag", "notitie"]];

      current.forEach((r, i) => {
        rows.push([r.date, r.name, r.amount, r.note || ""]);

        if (r.image) {
          const base64 = r.image.split(",")[1];
          zip.file(
            `${String(i + 1).padStart(2, "0")}_${safe(r.name || "bon")}.jpg`,
            base64,
            { base64: true }
          );
        }
      });

      zip.file(
        "overzicht.csv",
        rows
          .map((r) =>
            r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(";")
          )
          .join("\n")
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const file = new File([blob], `Bonnen_${month}.zip`, {
        type: "application/zip",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Bonnen ${month}`,
          text: settings.bericht,
        });
        msg("📤 Deelvenster geopend");
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();

        window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(
          "Bonnen " + month
        )}&body=${encodeURIComponent(
          settings.bericht +
            "\n\nZIP is gedownload. Voeg deze toe als bijlage."
        )}`;

        msg("ZIP gedownload; mail geopend");
      }
    } finally {
      setSending(false);
    }
  };

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
              <div className="card bigScan" onClick={() => setScanOpen(true)}>
                <div>📸 Bon scannen</div>
                <div className="small">
                  Foto maken → OCR leest bedrijf/bedrag → jij bevestigt
                </div>
              </div>

              <div className="card">
                <div className="cardTitle">Nog controleren</div>
                {unchecked.length ? (
                  unchecked.map((r) => (
                    <Receipt key={r.id} r={r} onClick={() => setEdit(r)} />
                  ))
                ) : (
                  <div className="empty">Alles is gecontroleerd.</div>
                )}
              </div>

              <div className="card">
                <div className="cardTitle">Laatste bonnen</div>
                {receipts.length ? (
                  receipts
                    .slice(0, 5)
                    .map((r) => (
                      <Receipt key={r.id} r={r} onClick={() => setEdit(r)} />
                    ))
                ) : (
                  <div className="empty">Nog geen bonnen.</div>
                )}
              </div>
            </>
          )}

          {tab === "archief" && (
            <>
              <div className="months">
                {months.map((m) => (
                  <button
                    key={m}
                    className={m === month ? "active" : ""}
                    onClick={() => setMonth(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="card">
                <div className="cardTitle">{month}</div>
                {current.length ? (
                  current.map((r) => (
                    <Receipt key={r.id} r={r} onClick={() => setEdit(r)} />
                  ))
                ) : (
                  <div className="empty">Geen bonnen.</div>
                )}
              </div>
            </>
          )}

          {tab === "verzend" && (
            <>
              <div className="card">
                <div className="cardTitle">Maandpakket</div>
                <p>
                  {current.length} bonnen in {month}
                </p>
                <p className="small">
                  {current.filter((r) => !r.ok).length} nog niet bevestigd. Je
                  kunt alsnog verzenden.
                </p>
              </div>

              <div className="card">
                <div className="cardTitle">Boekhouder</div>
                <p>{settings.email}</p>
              </div>

              <button
                className="btn primary"
                onClick={sendMonth}
                disabled={sending}
              >
                {sending ? "ZIP maken..." : "📦 ZIP maken en delen/mailen"}
              </button>

              <button className="btn ghost" onClick={() => setTab("archief")}>
                Controleer bonnen
              </button>
            </>
          )}

          {tab === "settings" && (
            <>
              <div className="card">
                <label>E-mailadres boekhouder</label>
                <input
                  className="input"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />

                <label>Standaard bericht</label>
                <textarea
                  className="input"
                  rows="4"
                  value={settings.bericht}
                  onChange={(e) =>
                    setSettings({ ...settings, bericht: e.target.value })
                  }
                />
              </div>

              <button
                className="btn success"
                onClick={() => msg("✓ Instellingen opgeslagen")}
              >
                Opslaan
              </button>

              <button
                className="btn danger"
                onClick={() => {
                  localStorage.clear();
                  setReceipts([]);
                  msg("Alle data gewist");
                }}
              >
                Alle gegevens wissen
              </button>
            </>
          )}
        </div>

        <div className="nav">
          <button
            className={tab === "home" ? "active" : ""}
            onClick={() => setTab("home")}
          >
            ⌂<br />
            Home
          </button>

          <button
            className={tab === "archief" ? "active" : ""}
            onClick={() => setTab("archief")}
          >
            ▤<br />
            Bonnen
          </button>

          <button className="scanBtn" onClick={() => setScanOpen(true)}>
            +
          </button>

          <button
            className={tab === "verzend" ? "active" : ""}
            onClick={() => setTab("verzend")}
          >
            ↗<br />
            Verzend
          </button>

          <button
            className={tab === "settings" ? "active" : ""}
            onClick={() => setTab("settings")}
          >
            ⚙<br />
            Instel
          </button>
        </div>

        {scanOpen && (
          <ScanModal onClose={() => setScanOpen(false)} onPhoto={onPhoto} />
        )}

        {edit && (
          <EditModal
            receipt={edit}
            setReceipt={setEdit}
            onSave={saveReceipt}
            onDelete={deleteReceipt}
            onRetake={retake}
          />
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

function Receipt({ r, onClick }) {
  return (
    <div className="receipt" onClick={onClick}>
      {r.image ? (
        <img className="thumb" src={r.image} />
      ) : (
        <div className="thumb">🧾</div>
      )}

      <div className="info">
        <div className="name">{r.name || "Onbekende bon"}</div>
        <div className="meta">
          {r.date} · {r.month}
        </div>
      </div>

      <div>
        <div className="amount">{r.amount || "€ —"}</div>
        <div className={`check ${r.ok ? "ok" : "warn"}`}>
          {r.ok ? "✓ OK" : "! Check"}
        </div>
      </div>
    </div>
  );
}

function ScanModal({ onClose, onPhoto }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(() =>
        setError("Camera niet toegestaan. Controleer Safari camera-toegang.")
      );

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const take = () => {
    const v = videoRef.current;
    const c = document.createElement("canvas");

    c.width = v.videoWidth || 1000;
    c.height = v.videoHeight || 1400;

    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);

    streamRef.current?.getTracks().forEach((t) => t.stop());

    onPhoto(c.toDataURL("image/jpeg", 0.86));
  };

  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalTop">
          <div className="modalTitle">Bon scannen</div>
          <button className="close" onClick={onClose}>
            Overslaan
          </button>
        </div>

        <div className="cameraBox">
          {error ? (
            <div className="empty">{error}</div>
          ) : (
            <video ref={videoRef} playsInline muted />
          )}
        </div>

        <button className="btn primary" onClick={take} disabled={!!error}>
          📸 Foto maken
        </button>

        <button className="btn ghost" onClick={onClose}>
          Annuleren
        </button>
      </div>
    </div>
  );
}

function EditModal({ receipt, setReceipt, onSave, onDelete, onRetake }) {
  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalTop">
          <div className="modalTitle">Controleer bon</div>
          <button className="close" onClick={() => setReceipt(null)}>
            Sluiten
          </button>
        </div>

        {receipt.image && <img className="preview" src={receipt.image} />}

        {receipt.ocrBusy && (
          <div className="ocr">
            OCR leest bon… bedrijf/bedrag worden automatisch ingevuld als dat
            lukt.
          </div>
        )}

        {!receipt.ocrBusy && (
          <div className="ocr">
            Controleer zelf. Als OCR niets vond, blijven velden leeg.
          </div>
        )}

        <label>Bedrijf / omschrijving</label>
        <input
          className="input"
          value={receipt.name || ""}
          onChange={(e) => setReceipt({ ...receipt, name: e.target.value })}
        />

        <div className="row2">
          <div>
            <label>Datum</label>
            <input
              className="input"
              value={receipt.date || ""}
              onChange={(e) => setReceipt({ ...receipt, date: e.target.value })}
            />
          </div>

          <div>
            <label>Bedrag</label>
            <input
              className="input"
              inputMode="decimal"
              value={receipt.amount || ""}
              onChange={(e) =>
                setReceipt({ ...receipt, amount: e.target.value })
              }
            />
          </div>
        </div>

        <label>Maand</label>
        <input
          className="input"
          value={receipt.month || ""}
          onChange={(e) => setReceipt({ ...receipt, month: e.target.value })}
        />

        <label>Notitie</label>
        <textarea
          className="input"
          rows="2"
          value={receipt.note || ""}
          onChange={(e) => setReceipt({ ...receipt, note: e.target.value })}
        />

        <button className="btn success" onClick={onSave}>
          ✓ Bevestigen
        </button>

        <div className="actions">
          <button className="btn ghost" onClick={onRetake}>
            Opnieuw
          </button>

          <button className="btn danger" onClick={onDelete}>
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  );
}

function parseReceiptText(text) {
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const ignored =
    /^(tel|btw|kvk|pin|maestro|visa|mastercard|datum|bon|receipt|factuur|invoice|totaal|subtotaal|cash|kaart)$/i;

  const company = (
    lines.find(
      (l) =>
        l.length >= 3 &&
        l.length <= 35 &&
        !/\d{4,}/.test(l) &&
        !ignored.test(l)
    ) || ""
  )
    .replace(/[^\wÀ-ÿ .&'-]/g, "")
    .trim();

  const amounts = [...text.matchAll(/(?:€\s*)?(\d{1,4}[,.]\d{2})/g)].map(
    (m) => m[1]
  );

  let amount = amounts.length ? amounts[amounts.length - 1] : "";
  if (amount) amount = "€ " + amount.replace(".", ",");

  const dateMatch = text.match(
    /\b(\d{1,2}[-/.]\d{1,2}[-/.](?:20)?\d{2})\b/
  );

  return {
    name: company,
    amount,
    ...(dateMatch ? { date: dateMatch[1] } : {}),
  };
}

function safe(s) {
  return String(s)
    .replace(/[^a-z0-9_-]+/gi, "_")
    .slice(0, 40) || "bon";
}
