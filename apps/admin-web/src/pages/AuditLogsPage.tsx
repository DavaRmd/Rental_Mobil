import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function AuditLogsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await api.listAuditLogs({ limit: 200 });
      setRows(res.data);
    } catch (e: any) {
      setErr(e?.error?.message || 'Gagal load audit logs');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid">
      <div className="card">
        <h1>Audit Logs</h1>
        <p className="muted">Read-only. Maks 200 item.</p>
        {err && <div className="error">{err}</div>}
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn secondary" onClick={load}>Refresh</button>
        </div>

        <div style={{ marginTop: 12, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Entity</th>
                <th>Action</th>
                <th>By</th>
                <th>Message</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.entity_type} #{a.entity_id}</td>
                  <td><span className="badge">{a.action}</span></td>
                  <td>{a.performed_by}</td>
                  <td>{a.message}</td>
                  <td>{a.created_at}</td>
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
