import { useState } from "react";

export default function App() {
  const [bonnen, setBonnen] = useState([]);
  const [current, setCurrent] = useState(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setCurrent({
      image: url,
      datum: new Date().toISOString().slice(0, 10),
      bedrag: "",
      omschrijving: "",
    });
  };

  const saveBon = () => {
    setBonnen([...bonnen, current]);
    setCurrent(null);
  };

  const deleteBon = () => {
    setCurrent(null);
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#111", minHeight: "100vh" }}>
      {!current && (
        <>
          <h2>Bon scannen</h2>
          <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} />

          <h3 style={{ marginTop: 20 }}>Opgeslagen bonnen</h3>
          {bonnen.map((b, i) => (
            <div key={i} style={{ marginBottom: 10, border: "1px solid #333", padding: 10 }}>
              <img src={b.image} style={{ width: 100 }} />
              <div>{b.datum}</div>
              <div>€ {b.bedrag}</div>
              <div>{b.omschrijving}</div>
            </div>
          ))}
        </>
      )}

      {current && (
        <>
          <h2>Controleer bon</h2>
          <img src={current.image} style={{ width: "100%", marginBottom: 10 }} />

          <input
            type="date"
            value={current.datum}
            onChange={(e) => setCurrent({ ...current, datum: e.target.value })}
          />

          <input
            placeholder="Bedrag"
            value={current.bedrag}
            onChange={(e) => setCurrent({ ...current, bedrag: e.target.value })}
          />

          <input
            placeholder="Omschrijving"
            value={current.omschrijving}
            onChange={(e) => setCurrent({ ...current, omschrijving: e.target.value })}
          />

          <div style={{ marginTop: 10 }}>
            <button onClick={saveBon}>Bevestigen</button>
            <button onClick={deleteBon} style={{ marginLeft: 10 }}>
              Verwijderen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
