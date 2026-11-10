
import { useState } from "react";

import Calendar from "../components/Calendar";
import DashboardStats from "../components/DashboardStats";
import { useScheduling } from "../context/SchedulingContext";

const statusLabels = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
};

function getToday(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AgendaPage() {
  const { appointments } = useScheduling();

  const [selectedDate, setSelectedDate] =
    useState(getToday);

  const dailyAppointments = appointments
    .filter(
      (appointment) =>
        appointment.date === selectedDate &&
        appointment.status !== "CANCELLED"
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const formattedDate = new Date(
    `${selectedDate}T12:00:00`
  ).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="page">
      <header className="page-header">
        <span className="eyebrow">
          Visão geral
        </span>

        <h1>Minha agenda</h1>

        <p>
          Acompanhe seus atendimentos.
        </p>
      </header>

      <DashboardStats appointments={appointments} />

      <div className="agenda-layout">
        <Calendar
          appointments={appointments}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <section className="daily-agenda">
          <h2>{formattedDate}</h2>

          {dailyAppointments.length === 0 ? (
            <div className="empty-state">
              <p>
                Nenhum atendimento agendado
                para esta data.
              </p>
            </div>
          ) : (
            dailyAppointments.map((appointment) => (
              <article
                className="daily-appointment"
                key={appointment.id}
              >
                <div className="time-column">
                  {appointment.time}
                </div>

                <div className="daily-info">
                  <strong>
                    {appointment.patientName}
                  </strong>

                  <span>
                    {appointment.modality}
                  </span>

                  <span
                    className={`status status-${appointment.status.toLowerCase()}`}
                  >
                    {statusLabels[appointment.status]}
                  </span>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
