
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";

export type Appointment = {
  id: number;
  patientName: string;
  phone: string;
  date: string;
  time: string;
  modality: string;
  status: AppointmentStatus;
};

export type TimeRange = {
  start: string;
  end: string;
};

export type DayAvailability = {
  dayOfWeek: number;
  enabled: boolean;
  ranges: TimeRange[];
};

export type AvailabilitySettings = {
  sessionDuration: number;
  days: DayAvailability[];
};
