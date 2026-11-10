
import { useState } from "react";
import { CalendarDays, Check, Clock3, Phone, X } from "lucide-react";
import type { Appointment } from "../types/scheduling";

type Props = {
  appointment: Appointment;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
};

export default function AppointmentCard({
  appointment,
  onConfirm,
  onCancel,
}: Props) {
  const [action, setAction] = useState<
    "confirm" | "cancel" | null
  >(null);

  const formattedDate = new Date(
    `${appointment.date}T12:00:00`
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  function executeAction() {
    if (action === "confirm") {
      onConfirm(appointment.id);
    }

    if (action === "cancel") {
      onCancel(appointment.id);
    }

    setAction(null);
  }

  return (
    <article className="appointment-card">
      <div className="card-header">
        <div className="avatar">
          {appointment.patientName.charAt(0)}
        </div>

        <div>
          <h3>{appointment.patientName}</h3>
          <span className="muted">
            {appointment.modality}
          </span>
        </div>
      </div>

      <div className="appointment-details">
        <p><CalendarDays aria-hidden="true" size={18} strokeWidth={1.8} /> {formattedDate}</p>
        <p><Clock3 aria-hidden="true" size={18} strokeWidth={1.8} /> {appointment.time}</p>
        <p><Phone aria-hidden="true" size={18} strokeWidth={1.8} /> {appointment.phone}</p>
      </div>

      {action ? (
        <div className="confirmation-panel">
          <p>
            {action === "confirm"
              ? "Confirmar este agendamento?"
              : "Cancelar esta solicitação?"}
          </p>

          <div className="card-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setAction(null)}
            >
              Voltar
            </button>

            <button
              className={
                action === "confirm"
                  ? "btn btn-primary"
                  : "btn btn-danger"
              }
              onClick={executeAction}
            >
              {action === "confirm" ? (
                <Check aria-hidden="true" size={18} strokeWidth={1.8} />
              ) : (
                <X aria-hidden="true" size={18} strokeWidth={1.8} />
              )}
              Sim, {action === "confirm"
                ? "confirmar"
                : "cancelar"}
            </button>
          </div>
        </div>
      ) : (
        <div className="card-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setAction("cancel")}
          >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
              Cancelar
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setAction("confirm")}
          >
              <Check aria-hidden="true" size={18} strokeWidth={1.8} />
              Confirmar
          </button>
        </div>
      )}
    </article>
  );
}
