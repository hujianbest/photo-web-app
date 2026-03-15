/**
 * 统一 API 请求封装：自动附带 Token，401 时清除登录态并跳转登录页
 */

const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
    : '';

const AUTH_KEYS = ['access_token', 'refresh_token', 'user_data'] as const;

function clearAuth() {
  if (typeof window === 'undefined') return;
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
  window.location.href = '/auth/login';
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const base = path.startsWith('http') ? '' : `${API_BASE}/api/v1`;
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!headers['Content-Type'] && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    throw new Error('未授权，请重新登录');
  }
  return res;
}

/** 请求 JSON 并解析，401 时清除登录态并跳转 */
export async function apiJson<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { message?: string })?.message || `请求失败: ${res.status}`);
  }
  return data as T;
}
