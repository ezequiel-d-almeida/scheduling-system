import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { adminApi } from "../services/api";
import type { AppointmentEventResponse, AvailabilityWindow, ScheduleBlock, ServiceResponse } from "../types/api";
import type { Appointment, AppointmentStatus } from "../types/scheduling";

type SchedulingContextType = {
  appointments: Appointment[]; services: ServiceResponse[]; windows: AvailabilityWindow[]; blocks: ScheduleBlock[];
  loading: boolean; error: string; refreshAdminData: () => Promise<void>;
  updateAppointmentStatus: (id: number, status: AppointmentStatus) => Promise<void>;
  rescheduleAppointment: (id: number, startsAt: string) => Promise<void>;
  appointmentHistory: (id: number) => Promise<AppointmentEventResponse[]>;
  createService: (name: string, durationMinutes: number) => Promise<void>;
  setServiceActive: (id: number, active: boolean) => Promise<void>;
  addWindow: (day: number, start: string, end: string) => Promise<void>; removeWindow: (id: number) => Promise<void>;
  addBlock: (startsAt: string, endsAt: string, reason: string) => Promise<void>; removeBlock: (id: number) => Promise<void>;
};
const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

function datePart(value: string) { return value.slice(0, 10); }
function timePart(value: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)); }
function toUiAppointment(item: import("../types/api").AppointmentResponse): Appointment {
  return { id: item.id, patientName: item.clientName, phone: item.clientPhone, date: datePart(item.startsAt), time: timePart(item.startsAt), modality: item.modality === "REMOTE" ? "Atendimento remoto" : "Atendimento presencial", status: item.status, serviceName: item.serviceName, startsAt: item.startsAt };
}

export function SchedulingProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]); const [services, setServices] = useState<ServiceResponse[]>([]); const [windows, setWindows] = useState<AvailabilityWindow[]>([]); const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const refreshAdminData = async () => { setLoading(true); setError(""); try { const [rawAppointments, nextServices, nextWindows, nextBlocks] = await Promise.all([adminApi.appointments(), adminApi.services(), adminApi.windows(), adminApi.blocks()]); setAppointments(rawAppointments.map(toUiAppointment)); setServices(nextServices); setWindows(nextWindows); setBlocks(nextBlocks); } catch { setError("Não foi possível carregar os dados administrativos."); } finally { setLoading(false); } };
  const updateAppointmentStatus = async (id: number, status: AppointmentStatus) => { const response = status === "CONFIRMED" ? await adminApi.confirm(id) : await adminApi.cancel(id); setAppointments((current) => current.map((item) => item.id === id ? toUiAppointment(response) : item)); };
  const rescheduleAppointment = async (id: number, startsAt: string) => { const response = await adminApi.reschedule(id, startsAt); setAppointments((current) => current.map((item) => item.id === id ? toUiAppointment(response) : item)); };
  const value = useMemo<SchedulingContextType>(() => ({ appointments, services, windows, blocks, loading, error, refreshAdminData, updateAppointmentStatus, rescheduleAppointment, appointmentHistory: adminApi.history,
    createService: async (name, duration) => { const response = await adminApi.createService(name, duration); setServices((current) => [...current.filter((service) => service.id !== response.id), response]); },
    setServiceActive: async (id, active) => { const response = await adminApi.updateServiceStatus(id, active); setServices((current) => current.map((service) => service.id === id ? response : service)); },
    addWindow: async (day, start, end) => { const response = await adminApi.addWindow(day, start, end); setWindows((current) => [...current.filter((window) => window.id !== response.id), response]); },
    removeWindow: async (id) => { await adminApi.removeWindow(id); setWindows((current) => current.filter((window) => window.id !== id)); },
    addBlock: async (startsAt, endsAt, reason) => { const response = await adminApi.addBlock(startsAt, endsAt, reason); setBlocks((current) => [...current.filter((block) => block.id !== response.id), response]); },
    removeBlock: async (id) => { await adminApi.removeBlock(id); setBlocks((current) => current.filter((block) => block.id !== id)); },
  }), [appointments, services, windows, blocks, loading, error]);
  return <SchedulingContext.Provider value={value}>{children}</SchedulingContext.Provider>;
}
export function useScheduling() { const context = useContext(SchedulingContext); if (!context) throw new Error("useScheduling precisa estar dentro de SchedulingProvider"); return context; }
