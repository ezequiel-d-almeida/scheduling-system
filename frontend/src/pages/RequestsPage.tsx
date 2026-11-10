
import AppointmentCard from "../components/AppointmentCard";
import { useScheduling } from "../context/SchedulingContext";

export default function RequestsPage() {
  const {
    appointments,
    updateAppointmentStatus,
  } = useScheduling();

  const pendingAppointments = appointments
    .filter((item) => item.status === "PENDING")
    .sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(
        `${b.date}T${b.time}`
      )
    );

  return (
    <div className="page">
      <header className="page-header">
        <span className="eyebrow">
          Gerenciamento
        </span>

        <h1>Solicitações</h1>

        <p>
          Você tem {pendingAppointments.length}{" "}
          solicitações aguardando confirmação.
        </p>
      </header>

      <div className="appointments-list">
        {pendingAppointments.length === 0 ? (
          <div className="empty-state">
            <h3>Tudo em dia!</h3>
            <p>
              Nenhuma solicitação pendente.
            </p>
          </div>
        ) : (
          pendingAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onConfirm={(id) =>
                updateAppointmentStatus(
                  id,
                  "CONFIRMED"
                )
              }
              onCancel={(id) =>
                updateAppointmentStatus(
                  id,
                  "CANCELLED"
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
