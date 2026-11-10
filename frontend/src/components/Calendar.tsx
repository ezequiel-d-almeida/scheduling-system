
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment } from "../types/scheduling";

type Props = {
  appointments: Appointment[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Calendar({
  appointments,
  selectedDate,
  onSelectDate,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [year, month] = selectedDate
      .split("-")
      .map(Number);

    return new Date(year, month - 1, 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const monthLabel = currentMonth.toLocaleDateString(
    "pt-BR",
    { month: "long", year: "numeric" }
  );

  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1
    ),
  ];

  function changeMonth(offset: number) {
    setCurrentMonth(
      new Date(year, month + offset, 1)
    );
  }

  return (
    <section className="calendar">
      <div className="calendar-header">
        <h3>{monthLabel}</h3>

        <div className="calendar-controls">
          <button
            aria-label="Mês anterior"
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.8} />
          </button>

          <button
            aria-label="Próximo mês"
            onClick={() => changeMonth(1)}
          >
            <ChevronRight aria-hidden="true" size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {["D", "S", "T", "Q", "Q", "S", "S"].map(
          (day, index) => (
            <span
              className="weekday"
              key={index}
            >
              {day}
            </span>
          )
        )}

        {calendarCells.map((day, index) => {
          if (day === null) {
            return (
              <span
                className="calendar-empty"
                key={`empty-${index}`}
              />
            );
          }

          const date = formatDate(
            new Date(year, month, day)
          );

          const hasAppointments = appointments.some(
            (appointment) =>
              appointment.date === date &&
              appointment.status !== "CANCELLED"
          );

          return (
            <button
              key={date}
              className={[
                "calendar-day",
                selectedDate === date ? "selected" : "",
                hasAppointments ? "has-events" : "",
              ].join(" ")}
              onClick={() => onSelectDate(date)}
              aria-pressed={selectedDate === date}
            >
              {day}
              {hasAppointments && (
                <span className="event-dot" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
