import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken, setUser } from '../lib/api';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 48 }}>
      <div className="card">
        <h1>Login Admin</h1>
        <p className="muted">UI minimal untuk demo. Base API: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1'}</p>

        <div style={{ marginTop: 14 }}>
          <div className="label">Email</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" />
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="label">Password</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}

        <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}>
          <button
            className="btn"
            disabled={loading}
            onClick={async () => {
              setErr(null);
              setLoading(true);
              try {
                const res = await api.login(email.trim(), password);
                setToken(res.access_token);
                setUser(res.user);
                nav('/');
              } catch (e: any) {
                setErr(e?.error?.message || 'Login gagal');
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              setEmail('');
              setPassword('');
              setErr(null);
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
