import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function MaintenancePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [desc, setDesc] = useState('Service rutin');
  const [vehicles, setVehicles] = useState<any[]>([]);

  async function load() {
    setErr(null);
    try {
      const res = await api.listMaintenance({ limit: 200 });
      setRows(res.data);
    } catch (e: any) {
      setErr(e?.error?.message || 'Gagal load maintenance');
    }
  }

  useEffect(() => {
    load();
    (async () => {
      try {
        const v = await api.listVehicles({ limit: 200 });
        setVehicles(v.data);
      } catch { /* ignore */ }
    })();
  }, []);

  return (
    <div className="grid">
      <div className="card">
        <h1>Maintenance</h1>

        <div className="card" style={{ borderStyle: 'dashed' }}>
          <h2>Create Maintenance</h2>
          <div className="grid grid-2">
            <div>
              <div className="label">Vehicle</div>
              <select className="input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Pilih vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    #{v.id} {v.name} ({v.plate_number}) [{v.status}]
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">Description</div>
              <input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
          </div>
          {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}
          <div className="row" style={{ marginTop: 10 }}>
            <button
              className="btn"
              onClick={async () => {
                setErr(null);
                try {
                  if (!vehicleId) throw new Error('Pilih vehicle');
                  const res = await api.createMaintenance({ vehicle_id: vehicleId, description: desc });
                  await load();
                  alert(`Maintenance created (id=${res.id})`);
                } catch (e: any) {
                  setErr(e?.error?.message || e?.message || 'Gagal create maintenance');
                }
              }}
            >
              Save
            </button>
            <button className="btn secondary" onClick={load}>Refresh</button>
            <span className="muted">Jika vehicle RENTED, backend bisa balas 409.</span>
          </div>
        </div>

        <div style={{ marginTop: 12, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.vehicle_id}</td>
                  <td>{m.description}</td>
                  <td><span className="badge">{m.status}</span></td>
                  <td>{m.created_at}</td>
                  <td>
                    {m.status === 'ONGOING' ? (
                      <button
                        className="btn secondary"
                        onClick={async () => {
                          try {
                            await api.completeMaintenance(m.id);
                            await load();
                          } catch (e: any) {
                            alert(e?.error?.message || 'Gagal complete');
                          }
                        }}
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="muted">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
