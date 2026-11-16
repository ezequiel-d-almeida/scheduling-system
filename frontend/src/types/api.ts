export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type AppointmentModality = "IN_PERSON" | "REMOTE";

export type ServiceResponse = {
  id: number;
  name: string;
  durationMinutes: number;
  active: boolean;
};

export type AppointmentResponse = {
  id: number;
  serviceId: number;
  serviceName: string;
  clientName: string;
  clientPhone: string;
  modality: AppointmentModality;
  location: string | null;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilityResponse = {
  serviceId: number;
  date: string;
  availableStarts: string[];
};

export type AppointmentEventResponse = {
  eventType: string;
  occurredAt: string;
};

export type AvailabilityWindow = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

export type ScheduleBlock = {
  id: number;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

export type AuthenticationStatus = {
  authenticated: boolean;
  username: string | null;
};

export type CreateAppointmentPayload = {
  serviceId: number;
  clientName: string;
  clientPhone: string;
  modality: AppointmentModality;
  location: string | null;
  startsAt: string;
};
