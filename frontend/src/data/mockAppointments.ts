
import type {
  Appointment,
  AvailabilitySettings,
} from "../types/scheduling";

const dateFromToday = (days: number): string => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "Mariana Costa",
    phone: "(87) 99999-1111",
    date: dateFromToday(0),
    time: "09:00",
    modality: "Atendimento online",
    status: "PENDING",
  },
  {
    id: 2,
    patientName: "Carlos Oliveira",
    phone: "(87) 99999-2222",
    date: dateFromToday(0),
    time: "14:00",
    modality: "Atendimento presencial",
    status: "CONFIRMED",
  },
  {
    id: 3,
    patientName: "Ana Beatriz",
    phone: "(87) 99999-3333",
    date: dateFromToday(1),
    time: "10:00",
    modality: "Atendimento online",
    status: "PENDING",
  },
  {
    id: 4,
    patientName: "Fernanda Lima",
    phone: "(87) 99999-4444",
    date: dateFromToday(2),
    time: "15:00",
    modality: "Atendimento online",
    status: "CONFIRMED",
  },
];

export const initialAvailability: AvailabilitySettings = {
  sessionDuration: 50,
  days: Array.from({ length: 7 }, (_, index) => ({
    dayOfWeek: index,
    enabled: index >= 1 && index <= 5,
    ranges: [{ start: "08:00", end: "17:00" }],
  })),
};
