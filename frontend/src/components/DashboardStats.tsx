
import type { Appointment } from "../types/scheduling";

type Props = {
  appointments: Appointment[];
};

export default function DashboardStats({
  appointments,
}: Props) {
  const pending = appointments.filter(
    (item) => item.status === "PENDING"
  ).length;

  const confirmed = appointments.filter(
    (item) => item.status === "CONFIRMED"
  ).length;

  const total = appointments.length;

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <span>Pendentes</span>
        <strong>{pending}</strong>
      </div>

      <div className="stat-card">
        <span>Confirmados</span>
        <strong>{confirmed}</strong>
      </div>

      <div className="stat-card">
        <span>Total</span>
        <strong>{total}</strong>
      </div>
    </section>
  );
}
