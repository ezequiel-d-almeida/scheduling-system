
import { useState } from "react";
import { CalendarDays, Check, Clock3, Phone, RotateCcw, X } from "lucide-react";
import type { Appointment } from "../types/scheduling";
import type { AppointmentEventResponse } from "../types/api";

const toRecifeOffsetDateTime = (value: string) => `${value}${value.length === 16 ? ":00" : ""}-03:00`;

type Props = {
  appointment: Appointment;
  onConfirm: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
  onReschedule: (id: number, startsAt: string) => Promise<void>;
  onHistory: (id: number) => Promise<AppointmentEventResponse[]>;
};

export default function AppointmentCard({
  appointment,
  onConfirm,
  onCancel,
  onReschedule,
  onHistory,
}: Props) {
  const [action, setAction] = useState<
    "confirm" | "cancel" | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [newDateTime, setNewDateTime] = useState("");
  const [history, setHistory] = useState<AppointmentEventResponse[] | null>(null);

  const formattedDate = new Date(
    `${appointment.date}T12:00:00`
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  async function executeAction() {
    setBusy(true); setError("");
    try {
    if (action === "confirm") {
      await onConfirm(appointment.id);
    }

    if (action === "cancel") {
      await onCancel(appointment.id);
    }
    } catch { setError("Não foi possível atualizar a solicitação."); }
    finally { setBusy(false); }
    setAction(null);
  }

  async function submitReschedule() {
    if (!newDateTime) return;
    setBusy(true); setError("");
    try { await onReschedule(appointment.id, toRecifeOffsetDateTime(newDateTime)); setRescheduling(false); setNewDateTime(""); }
    catch (exception) { setError(exception instanceof Error ? exception.message : "Não foi possível remarcar. Verifique a disponibilidade."); }
    finally { setBusy(false); }
  }

  async function loadHistory() { try { setHistory(await onHistory(appointment.id)); } catch { setError("Não foi possível carregar o histórico."); } }

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
              onClick={() => void executeAction()}
              disabled={busy}
            >
              {action === "confirm" ? (
                <Check aria-hidden="true" size={18} strokeWidth={1.8} />
              ) : (
                <X aria-hidden="true" size={18} strokeWidth={1.8} />
              )}
              {busy ? "Atualizando..." : <>Sim, {action === "confirm"
                ? "confirmar"
                : "cancelar"}</>}
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
          <button className="btn btn-secondary" onClick={() => setRescheduling((value) => !value)}><RotateCcw aria-hidden="true" size={18} strokeWidth={1.8} />Remarcar</button>
          <button className="btn btn-secondary" onClick={() => void loadHistory()}>Histórico</button>
        </div>
      )}
      {rescheduling && <section className="reschedule-panel" aria-label="Remarcar agendamento">
        <div className="reschedule-summary">
          <p className="reschedule-eyebrow">Remarcação</p>
          <h4>Escolha um novo horário</h4>
          <p>Reserva atual: {formattedDate}, às {appointment.time}.</p>
        </div>
        <label className="reschedule-field" htmlFor={`reschedule-${appointment.id}`}>
          Nova data e horário
          <input id={`reschedule-${appointment.id}`} type="datetime-local" value={newDateTime} onChange={(event) => setNewDateTime(event.target.value)} />
        </label>
        <div className="card-actions reschedule-actions"><button className="btn btn-secondary" onClick={() => setRescheduling(false)}>Voltar</button><button className="btn btn-primary" disabled={!newDateTime || busy} onClick={() => void submitReschedule()}>{busy ? "Remarcando..." : "Confirmar remarcação"}</button></div>
      </section>}
      {history && <div className="confirmation-panel"><p>Histórico</p><ul>{history.map((event) => <li key={`${event.eventType}-${event.occurredAt}`}>{event.eventType} — {new Date(event.occurredAt).toLocaleString("pt-BR")}</li>)}</ul></div>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </article>
  );
}
