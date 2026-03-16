/**
 * 统一 API 请求封装：自动附带 Token，401 时先尝试刷新 Token 再重试，失败则跳转登录页并带回跳地址
 */

export const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
    : '';

const AUTH_KEYS = ['access_token', 'refresh_token', 'user_data'] as const;

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = redirect ? `/auth/login?redirect=${redirect}` : '/auth/login';
}

function clearAuth() {
  if (typeof window === 'undefined') return;
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
  redirectToLogin();
}

/** 尝试用 refresh_token 换新 access_token，成功返回 true 并写入 localStorage */
async function tryRefreshToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;
  try {
    const url = `${API_BASE}/api/v1/auth/refresh`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    if (data?.success && data?.data?.access_token) {
      localStorage.setItem('access_token', data.data.access_token);
      if (data.data.refresh_token) {
        localStorage.setItem('refresh_token', data.data.refresh_token);
      }
      if (data.data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
      }
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  isRetryAfterRefresh = false
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
    const isRefreshEndpoint = path.includes('/auth/refresh');
    if (!isRefreshEndpoint && !isRetryAfterRefresh && (await tryRefreshToken())) {
      return apiFetch(path, options, true);
    }
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
