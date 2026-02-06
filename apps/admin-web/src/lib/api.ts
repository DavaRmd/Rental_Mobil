export type ApiError = { error: { code: string; message: string; details: any } };

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function clearToken() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

export function getUser(): any | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(u: any) {
  localStorage.setItem('user', JSON.stringify(u));
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init.headers as any),
  };
  if (token) headers['authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw data as ApiError;
  }
  return data as T;
}

export const api = {
  health: () => request<{ status: string }>(`/health`, { method: 'GET' }),
  ready: () => request<any>(`/ready`, { method: 'GET' }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: any }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  dashboardSummary: () =>
    request<{ total: number; available: number; rented: number; maintenance: number }>(`/dashboard/summary`, { method: 'GET' }),

  listVehicles: (q: { status?: string; query?: string; limit?: number; offset?: number } = {}) => {
    const p = new URLSearchParams();
    if (q.status) p.set('status', q.status);
    if (q.query) p.set('query', q.query);
    p.set('limit', String(q.limit ?? 50));
    p.set('offset', String(q.offset ?? 0));
    return request<{ data: any[]; limit: number; offset: number }>(`/vehicles?${p.toString()}`, { method: 'GET' });
  },
  createVehicle: (body: any) => request<{ id: number }>(`/vehicles`, { method: 'POST', body: JSON.stringify(body) }),
  getVehicle: (id: number) => request<any>(`/vehicles/${id}`, { method: 'GET' }),

  createRental: (body: any) => request<{ id: number }>(`/rentals`, { method: 'POST', body: JSON.stringify(body) }),
  completeRental: (id: number) => request<{ ok: boolean }>(`/rentals/${id}/complete`, { method: 'POST' }),
  cancelRental: (id: number) => request<{ ok: boolean }>(`/rentals/${id}/cancel`, { method: 'POST' }),
  listRentals: (q: { status?: string; vehicle_id?: number; query?: string; start_from?: string; start_to?: string; limit?: number; offset?: number } = {}) => {
    const p = new URLSearchParams();
    if (q.status) p.set('status', q.status);
    if (q.vehicle_id) p.set('vehicle_id', String(q.vehicle_id));
    if (q.query) p.set('query', q.query);
    if (q.start_from) p.set('start_from', q.start_from);
    if (q.start_to) p.set('start_to', q.start_to);
    p.set('limit', String(q.limit ?? 50));
    p.set('offset', String(q.offset ?? 0));
    return request<{ data: any[]; total: number; limit: number; offset: number }>(`/rentals?${p.toString()}`, { method: 'GET' });
  },



  listMaintenance: (q: { status?: string; vehicle_id?: number; limit?: number; offset?: number } = {}) => {
    const p = new URLSearchParams();
    if (q.status) p.set('status', q.status);
    if (q.vehicle_id) p.set('vehicle_id', String(q.vehicle_id));
    p.set('limit', String(q.limit ?? 50));
    p.set('offset', String(q.offset ?? 0));
    return request<{ data: any[]; limit: number; offset: number }>(`/maintenance?${p.toString()}`, { method: 'GET' });
  },
  createMaintenance: (body: any) => request<{ id: number }>(`/maintenance`, { method: 'POST', body: JSON.stringify(body) }),
  completeMaintenance: (id: number) => request<{ ok: boolean }>(`/maintenance/${id}/complete`, { method: 'POST' }),

  listAuditLogs: (q: { entity_type?: string; entity_id?: number; user_id?: number; limit?: number; offset?: number } = {}) => {
    const p = new URLSearchParams();
    if (q.entity_type) p.set('entity_type', q.entity_type);
    if (q.entity_id) p.set('entity_id', String(q.entity_id));
    if (q.user_id) p.set('user_id', String(q.user_id));
    p.set('limit', String(q.limit ?? 200));
    p.set('offset', String(q.offset ?? 0));
    return request<{ data: any[]; limit: number; offset: number }>(`/audit-logs?${p.toString()}`, { method: 'GET' });
  },
};
