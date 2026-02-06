import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function VehiclesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState(350000);

  async function load() {
    setErr(null);
    try {
      const res = await api.listVehicles({ query: query || undefined, status: status || undefined });
      setRows(res.data);
    } catch (e: any) {
      setErr(e?.error?.message || 'Gagal load vehicles');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid">
      <div className="card">
        <h1>Vehicles</h1>
        <div className="row" style={{ marginTop: 8 }}>
          <input className="input" style={{ maxWidth: 280 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari name / plate" />
          <select className="input" style={{ maxWidth: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="RENTED">RENTED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button className="btn secondary" onClick={load}>Filter</button>
          <button className="btn" onClick={() => setCreating((v) => !v)}>{creating ? 'Tutup Form' : 'Tambah Vehicle'}</button>
        </div>

        {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}

        {creating && (
          <div className="card" style={{ marginTop: 12, borderStyle: 'dashed' }}>
            <h2>Create Vehicle</h2>
            <div className="grid grid-2">
              <div>
                <div className="label">Name</div>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Avanza" />
              </div>
              <div>
                <div className="label">Plate number</div>
                <input className="input" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="B 1234 ABC" />
              </div>
              <div>
                <div className="label">Type</div>
                <input className="input" value={type} onChange={(e) => setType(e.target.value)} placeholder="MPV" />
              </div>
              <div>
                <div className="label">Price per day</div>
                <input className="input" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="btn"
                onClick={async () => {
                  setErr(null);
                  try {
                    const res = await api.createVehicle({ name, plate_number: plate, type, price_per_day: price, is_active: true });
                    setName(''); setPlate(''); setType(''); setPrice(350000);
                    await load();
                    alert(`Vehicle created (id=${res.id})`);
                  } catch (e: any) {
                    setErr(e?.error?.message || 'Gagal create vehicle');
                  }
                }}
              >
                Save
              </button>
              <span className="muted">Validasi utama tetap di backend.</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: 12, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Plate</th>
                <th>Type</th>
                <th>Price/day</th>
                <th>Status</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.name}</td>
                  <td>{v.plate_number}</td>
                  <td>{v.type}</td>
                  <td>{v.price_per_day}</td>
                  <td><span className="badge">{v.status}</span></td>
                  <td>{v.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="muted">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
