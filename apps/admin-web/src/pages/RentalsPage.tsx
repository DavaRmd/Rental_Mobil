import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function RentalsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  // create form
  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [err, setErr] = useState<string | null>(null);

  // list
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadVehiclesForDropdown() {
    try {
      const res = await api.listVehicles({ limit: 200 });
      setVehicles(res.data);
    } catch {
      // ignore
    }
  }

  async function loadRentals() {
    setLoading(true);
    try {
      const res = await api.listRentals({ status: status || undefined, query: query || undefined, limit: 50, offset: 0 });
      setRows(res.data);
    } catch (e: any) {
      setErr(e?.error?.message || 'Gagal load rentals');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehiclesForDropdown();
    loadRentals();
  }, []);

  async function complete(id: number) {
    setErr(null);
    try {
      await api.completeRental(id);
      await loadRentals();
      alert('Rental completed.');
    } catch (e: any) {
      setErr(e?.error?.message || 'Gagal complete rental');
    }
  }

  async function cancel(id: number) {
    setErr(null);
    try {
      await api.cancelRental(id);
      await loadRentals();
      alert('Rental canceled.');
    } catch (e: any) {
      setErr(e?.error?.message || 'Gagal cancel rental');
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <h1>Rentals</h1>
        <p className="muted">Create + List rentals (minimal) sesuai endpoint backend.</p>

        <div className="card" style={{ borderStyle: 'dashed', marginTop: 12 }}>
          <h2>Create Rental</h2>
          <div className="grid grid-2" style={{ marginTop: 10 }}>
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
              <div className="label">Customer name</div>
              <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama customer" />
            </div>
            <div>
              <div className="label">Start at (ISO-8601 UTC)</div>
              <input className="input" value={startAt} onChange={(e) => setStartAt(e.target.value)} placeholder="2026-02-10T10:00:00Z" />
            </div>
            <div>
              <div className="label">End at (ISO-8601 UTC)</div>
              <input className="input" value={endAt} onChange={(e) => setEndAt(e.target.value)} placeholder="2026-02-12T10:00:00Z" />
            </div>
          </div>

          {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}

          <div className="row" style={{ marginTop: 12 }}>
            <button
              className="btn"
              onClick={async () => {
                setErr(null);
                try {
                  if (!vehicleId) throw new Error('Pilih vehicle');
                  const res = await api.createRental({ vehicle_id: vehicleId, customer_name: customerName, start_at: startAt, end_at: endAt });
                  alert(`Rental created (id=${res.id})`);
                  await loadRentals();
                } catch (e: any) {
                  setErr(e?.error?.message || e?.message || 'Gagal create rental');
                }
              }}
            >
              Create Rental
            </button>
            <button className="btn secondary" onClick={loadRentals} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh List'}
            </button>
            <span className="muted">Jika overlap, backend akan balas 409.</span>
          </div>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <input className="input" style={{ maxWidth: 260 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari customer/vehicle/plate" />
          <select className="input" style={{ maxWidth: 210 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <button className="btn secondary" onClick={loadRentals} disabled={loading}>
            Apply Filter
          </button>
        </div>

        <div style={{ marginTop: 12, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Customer</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <div><strong>{r.vehicle_name}</strong></div>
                    <div className="muted">#{r.vehicle_id} • {r.plate_number}</div>
                  </td>
                  <td>{r.customer_name}</td>
                  <td className="muted">{r.start_at}</td>
                  <td className="muted">{r.end_at}</td>
                  <td><span className="badge">{r.status}</span></td>
                  <td>
                    {r.status === 'ACTIVE' ? (
                      <div className="row">
                        <button className="btn secondary" onClick={() => complete(r.id)}>
                          Complete
                        </button>
                        <button className="btn secondary" onClick={() => cancel(r.id)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="muted">-</span>
                    )}
                  </td>
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

        <p className="muted" style={{ marginTop: 10 }}>
          Catatan: tombol Complete/Cancel hanya muncul untuk status <strong>ACTIVE</strong>.
        </p>
      </div>
    </div>
  );
}
