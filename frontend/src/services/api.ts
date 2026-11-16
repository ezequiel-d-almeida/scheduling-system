import type { AppointmentEventResponse, AppointmentResponse, AuthenticationStatus, AvailabilityResponse, AvailabilityWindow, CreateAppointmentPayload, ScheduleBlock, ServiceResponse } from "../types/api";

type CsrfToken = { headerName: string; token: string };
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
let csrfToken: CsrfToken | null = null;

async function request<T>(path: string, init: RequestInit = {}, csrf = false): Promise<T> {
  if (csrf) await loadCsrfToken();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (csrfToken && csrf) headers.set(csrfToken.headerName, csrfToken.token);
  const response = await fetch(path, { ...init, headers, credentials: "include" });
  if (!response.ok) {
    let detail = "Não foi possível concluir a solicitação.";
    try { detail = ((await response.json()) as { detail?: string }).detail ?? detail; } catch { /* sem JSON */ }
    if (response.status === 401) {
      csrfToken = null;
      window.dispatchEvent(new Event("scheduling:unauthorized"));
    }
    throw new ApiError(response.status, detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function loadCsrfToken(): Promise<CsrfToken> { csrfToken = await request<CsrfToken>("/api/auth/csrf"); return csrfToken; }

export const authApi = {
  me: () => request<AuthenticationStatus>("/api/auth/me"),
  login: (username: string, password: string) => request<AuthenticationStatus>("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }, true),
  logout: async () => { await request<void>("/api/auth/logout", { method: "POST" }, true); csrfToken = null; },
};

export const publicApi = {
  services: () => request<ServiceResponse[]>("/api/public/services"),
  availability: (date: string, serviceId: number) => request<AvailabilityResponse>(`/api/public/availability?${new URLSearchParams({ date, serviceId: String(serviceId) })}`),
  createAppointment: (payload: CreateAppointmentPayload) => request<AppointmentResponse>("/api/public/appointments", { method: "POST", body: JSON.stringify(payload) }),
};

export const adminApi = {
  appointments: () => request<AppointmentResponse[]>("/api/admin/appointments"),
  confirm: (id: number) => request<AppointmentResponse>(`/api/admin/appointments/${id}/confirm`, { method: "POST" }, true),
  cancel: (id: number) => request<AppointmentResponse>(`/api/admin/appointments/${id}/cancel`, { method: "POST" }, true),
  reschedule: (id: number, startsAt: string) => request<AppointmentResponse>(`/api/admin/appointments/${id}/reschedule`, { method: "POST", body: JSON.stringify({ startsAt }) }, true),
  history: (id: number) => request<AppointmentEventResponse[]>(`/api/admin/appointments/${id}/history`),
  services: () => request<ServiceResponse[]>("/api/services"),
  createService: (name: string, durationMinutes: number) => request<ServiceResponse>("/api/services", { method: "POST", body: JSON.stringify({ name, durationMinutes }) }, true),
  updateServiceStatus: (id: number, active: boolean) => request<ServiceResponse>(`/api/services/${id}/status`, { method: "PATCH", body: JSON.stringify({ active }) }, true),
  windows: () => request<AvailabilityWindow[]>("/api/admin/schedule/windows"),
  addWindow: (dayOfWeek: number, startTime: string, endTime: string) => request<AvailabilityWindow>("/api/admin/schedule/windows", { method: "POST", body: JSON.stringify({ dayOfWeek, startTime, endTime }) }, true),
  removeWindow: (id: number) => request<void>(`/api/admin/schedule/windows/${id}`, { method: "DELETE" }, true),
  blocks: () => request<ScheduleBlock[]>("/api/admin/schedule/blocks"),
  addBlock: (startsAt: string, endsAt: string, reason: string) => request<ScheduleBlock>("/api/admin/schedule/blocks", { method: "POST", body: JSON.stringify({ startsAt, endsAt, reason: reason || null }) }, true),
  removeBlock: (id: number) => request<void>(`/api/admin/schedule/blocks/${id}`, { method: "DELETE" }, true),
};
