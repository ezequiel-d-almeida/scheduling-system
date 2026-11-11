
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  initialAvailability,
  mockAppointments,
} from "../data/mockAppointments";

import type {
  Appointment,
  AppointmentStatus,
  AvailabilitySettings,
} from "../types/scheduling";

type SchedulingContextType = {
  appointments: Appointment[];
  availability: AvailabilitySettings;
  updateAppointmentStatus: (
    id: number,
    status: AppointmentStatus
  ) => void;
  updateAvailability: (
    settings: AvailabilitySettings
  ) => void;
  requestAppointment: (
    appointment: Omit<Appointment, "id" | "status">
  ) => void;
};

const SchedulingContext = createContext<
  SchedulingContextType | undefined
>(undefined);

export function SchedulingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);

  const [availability, setAvailability] =
    useState<AvailabilitySettings>(initialAvailability);

  function updateAppointmentStatus(
    id: number,
    status: AppointmentStatus
  ) {
    if (
      status !== "CONFIRMED" &&
      status !== "CANCELLED"
    ) {
      return;
    }

    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === id &&
        appointment.status === "PENDING"
          ? { ...appointment, status }
          : appointment
      )
    );
  }

  function updateAvailability(
    settings: AvailabilitySettings
  ) {
    setAvailability(settings);
  }

  function requestAppointment(
    appointment: Omit<Appointment, "id" | "status">
  ) {
    setAppointments((previous) => [
      ...previous,
      {
        ...appointment,
        id: Math.max(0, ...previous.map((item) => item.id)) + 1,
        status: "PENDING",
      },
    ]);
  }

  return (
    <SchedulingContext.Provider
      value={{
        appointments,
        availability,
        updateAppointmentStatus,
        updateAvailability,
        requestAppointment,
      }}
    >
      {children}
    </SchedulingContext.Provider>
  );
}

export function useScheduling() {
  const context = useContext(SchedulingContext);

  if (!context) {
    throw new Error(
      "useScheduling precisa estar dentro de SchedulingProvider"
    );
  }

  return context;
}
