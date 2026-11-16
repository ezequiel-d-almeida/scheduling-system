
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
  serviceName: string;
  startsAt: string;
};
