import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

type SeedState = 'idle' | 'running' | 'done' | 'error';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [seedState, setSeedState] = useState<SeedState>('idle');
  const [seedMsg, setSeedMsg] = useState<string>('');
  const [seedErr, setSeedErr] = useState<string | null>(null);

  async function loadSummary() {
    setErr(null);
    try {
      const s = await api.dashboardSummary();
      setSummary(s);
    } catch (e: any) {
      setErr(e?.error?.message || 'Gagal load dashboard');
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  async function seedDemo() {
    setSeedErr(null);
    setSeedState('running');
    setSeedMsg('Mengecek data...');

    try {
      // 1) cek vehicles (kalau kosong, buat 3 vehicle dummy)
      const list = await api.listVehicles({ limit: 50, offset: 0 });
      let createdIds: number[] = [];

      if (!list.data.length) {
        setSeedMsg('Membuat vehicles dummy...');
        const stamp = Date.now().toString().slice(-6);

        const v1 = await api.createVehicle({
          name: 'Toyota Avanza (Demo)',
          plate_number: `B ${stamp} AVZ`,
          type: 'MPV',
          price_per_day: 350000,
          is_active: true,
        });
        const v2 = await api.createVehicle({
          name: 'Honda Brio (Demo)',
          plate_number: `B ${stamp} BRIO`,
          type: 'Hatchback',
          price_per_day: 300000,
          is_active: true,
        });
        const v3 = await api.createVehicle({
          name: 'Suzuki Ertiga (Demo)',
          plate_number: `B ${stamp} ERT`,
          type: 'MPV',
          price_per_day: 330000,
          is_active: true,
        });
        createdIds = [v1.id, v2.id, v3.id];
      }

      // 2) buat contoh rental (jika ada available)
      setSeedMsg('Menyiapkan rental & maintenance demo...');
      const avail = await api.listVehicles({ status: 'AVAILABLE', limit: 200, offset: 0 });
      if (avail.data.length >= 1) {
        const v = avail.data[0];
        const now = new Date();
        const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        try {
          await api.createRental({
            vehicle_id: v.id,
            customer_name: 'Customer Demo',
            start_at: start.toISOString(),
            end_at: end.toISOString(),
          });
        } catch {
          // kalau gagal (mis. constraint), lanjut saja
        }
      }

      // 3) buat contoh maintenance untuk vehicle yang tidak RENTED
      const anyVehicles = await api.listVehicles({ limit: 200, offset: 0 });
      const targetForMaintenance = anyVehicles.data.find((x: any) => x.status !== 'RENTED') || anyVehicles.data[0];
      if (targetForMaintenance) {
        try {
          await api.createMaintenance({
            vehicle_id: targetForMaintenance.id,
            description: 'Maintenance Demo (service ringan)',
          });
        } catch {
          // ignore
        }
      }

      setSeedMsg(createdIds.length ? `Seed selesai. Vehicles dibuat: ${createdIds.join(', ')}` : 'Seed selesai. Data sudah ada, hanya refresh demo.');
      setSeedState('done');
      await loadSummary();
    } catch (e: any) {
      setSeedErr(e?.error?.message || e?.message || 'Seed gagal');
      setSeedState('error');
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Dashboard</h1>
            <p className="muted">Ringkasan armada dari backend.</p>
          </div>
          <div className="row">
            <button className="btn secondary" onClick={loadSummary}>
              Refresh
            </button>
            <button className="btn" onClick={seedDemo} disabled={seedState === 'running'}>
              {seedState === 'running' ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 6 }}>
          Tombol <strong>Seed Demo Data</strong> akan membuat data dummy otomatis agar demo cepat (vehicles + contoh rental/maintenance jika memungkinkan).
        </p>

        {seedMsg && <div className="muted" style={{ marginTop: 8 }}>{seedMsg}</div>}
        {seedErr && <div className="error" style={{ marginTop: 8 }}>{seedErr}</div>}
        {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}

        {!summary ? (
          <div className="muted" style={{ marginTop: 10 }}>Loading...</div>
        ) : (
          <div className="grid grid-2" style={{ marginTop: 10 }}>
            <Stat label="Total" value={summary.total} />
            <Stat label="Available" value={summary.available} />
            <Stat label="Rented" value={summary.rented} />
            <Stat label="Maintenance" value={summary.maintenance} />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="card" style={{ borderStyle: 'dashed' }}>
      <div className="muted">{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value ?? '-'}</div>
    </div>
  );
}
