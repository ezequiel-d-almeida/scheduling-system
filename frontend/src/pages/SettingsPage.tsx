
import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { useScheduling } from "../context/SchedulingContext";

import type {
  AvailabilitySettings,
  TimeRange,
} from "../types/scheduling";

const weekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default function SettingsPage() {
  const { availability, updateAvailability } =
    useScheduling();

  const [settings, setSettings] =
    useState<AvailabilitySettings>(() =>
      structuredClone(availability)
    );

  const [message, setMessage] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  function updateDayEnabled(
    dayIndex: number,
    enabled: boolean
  ) {
    setSettings((previous) => ({
      ...previous,
      days: previous.days.map((day) =>
        day.dayOfWeek === dayIndex
          ? { ...day, enabled }
          : day
      ),
    }));

    setMessage("");
  }

  function updateRange(
    dayIndex: number,
    rangeIndex: number,
    field: keyof TimeRange,
    value: string
  ) {
    setSettings((previous) => ({
      ...previous,
      days: previous.days.map((day) =>
        day.dayOfWeek === dayIndex
          ? {
              ...day,
              ranges: day.ranges.map((range, index) =>
                index === rangeIndex
                  ? { ...range, [field]: value }
                  : range
              ),
            }
          : day
      ),
    }));

    setMessage("");
  }

  function addRange(dayIndex: number) {
    setSettings((previous) => ({
      ...previous,
      days: previous.days.map((day) =>
        day.dayOfWeek === dayIndex
          ? {
              ...day,
              ranges: [
                ...day.ranges,
                { start: "13:00", end: "17:00" },
              ],
            }
          : day
      ),
    }));

    setMessage("");
  }

  function removeRange(
    dayIndex: number,
    rangeIndex: number
  ) {
    setSettings((previous) => ({
      ...previous,
      days: previous.days.map((day) =>
        day.dayOfWeek === dayIndex
          ? {
              ...day,
              ranges: day.ranges.filter(
                (_, index) => index !== rangeIndex
              ),
            }
          : day
      ),
    }));

    setMessage("");
  }

  function validateSettings(): string | null {
    const activeDays = settings.days.filter(
      (day) => day.enabled
    );

    if (activeDays.length === 0) {
      return "Selecione pelo menos um dia de atendimento.";
    }

    for (const day of activeDays) {
      if (day.ranges.length === 0) {
        return `${weekDays[day.dayOfWeek]} precisa ter um horário.`;
      }

      const sortedRanges = [...day.ranges].sort(
        (a, b) => a.start.localeCompare(b.start)
      );

      for (let i = 0; i < sortedRanges.length; i++) {
        const range = sortedRanges[i];

        if (range.start >= range.end) {
          return `Horário inválido em ${weekDays[day.dayOfWeek]}.`;
        }

        if (
          i > 0 &&
          sortedRanges[i - 1].end > range.start
        ) {
          return `Existem horários sobrepostos em ${weekDays[day.dayOfWeek]}.`;
        }
      }
    }

    return null;
  }

  function handleSave() {
    const error = validateSettings();

    if (error) {
      setMessage(error);
      return;
    }

    updateAvailability(structuredClone(settings));
    setMessage("Configurações salvas nesta demonstração.");
  }

  return (
    <div className="page">
      <header className="page-header">
        <span className="eyebrow">
          Preferências
        </span>

        <h1>Configurações</h1>

        <p>
          Defina seus dias e horários de atendimento.
        </p>
      </header>

      <section className="settings-section">
        <h2>Duração da sessão</h2>

        <label htmlFor="session-duration">
          Tempo de cada atendimento
        </label>

        <select
          id="session-duration"
          value={settings.sessionDuration}
          onChange={(event) => {
            setSettings((previous) => ({
              ...previous,
              sessionDuration: Number(
                event.target.value
              ),
            }));

            setMessage("");
          }}
        >
          <option value={30}>30 minutos</option>
          <option value={50}>50 minutos</option>
          <option value={60}>60 minutos</option>
          <option value={90}>90 minutos</option>
        </select>
      </section>

      
      <section className="settings-section">
            <h2>Dias de atendimento</h2>

            <p className="muted">
                Selecione os dias em que deseja atender.
            </p>

            <div className="weekday-selector">
                {settings.days.map((day) => (
                <button
                    key={day.dayOfWeek}
                    type="button"
                    className={`weekday-card ${
                    day.enabled ? "enabled" : ""
                    }`}
                    aria-pressed={day.enabled}
                    aria-label={weekDays[day.dayOfWeek]}
                    onClick={() => {
                    updateDayEnabled(
                        day.dayOfWeek,
                        !day.enabled
                    );

                    if (
                        day.enabled &&
                        selectedDay === day.dayOfWeek
                    ) {
                        setSelectedDay(null);
                    }
                    }}
                >
                    <span>
                    {weekDays[day.dayOfWeek].slice(0, 3)}
                    </span>

                    <span className="weekday-indicator">
                    {day.enabled ? (
                    <Check aria-hidden="true" size={18} strokeWidth={2} />
                    ) : (
                    <Plus aria-hidden="true" size={18} strokeWidth={2} />
                    )}
                    </span>
                </button>
                ))}
            </div>

            <div className="schedule-summary">
                <h3>Horários por dia</h3>

                {settings.days
                .filter((day) => day.enabled)
                .map((day) => (
                    <div
                    className="schedule-day"
                    key={day.dayOfWeek}
                    >
                    <button
                        type="button"
                        className={`schedule-day-button ${
                        selectedDay === day.dayOfWeek
                            ? "selected"
                            : ""
                        }`}
                        aria-expanded={
                        selectedDay === day.dayOfWeek
                        }
                        onClick={() =>
                        setSelectedDay(
                            selectedDay === day.dayOfWeek
                            ? null
                            : day.dayOfWeek
                        )
                        }
                    >
                        <div>
                        <strong>
                            {weekDays[day.dayOfWeek]}
                        </strong>

                        <span>
                            {day.ranges.length > 0
                            ? day.ranges
                                .map(
                                    (range) =>
                                    `${range.start}–${range.end}`
                                )
                                .join(" · ")
                            : "Nenhum horário configurado"}
                        </span>
                        </div>

                        <span className="schedule-chevron">
                        {selectedDay === day.dayOfWeek ? (
                            <ChevronUp aria-hidden="true" size={20} strokeWidth={1.8} />
                        ) : (
                            <ChevronDown aria-hidden="true" size={20} strokeWidth={1.8} />
                        )}
                        </span>
                    </button>

                    {selectedDay === day.dayOfWeek && (
                        <div className="schedule-editor">
                        {day.ranges.map((range, index) => (
                            <div
                            className="time-range"
                            key={index}
                            >
                            <label>
                                Início
                                <input
                                type="time"
                                value={range.start}
                                onChange={(event) =>
                                    updateRange(
                                    day.dayOfWeek,
                                    index,
                                    "start",
                                    event.target.value
                                    )
                                }
                                />
                            </label>

                            <label>
                                Término
                                <input
                                type="time"
                                value={range.end}
                                onChange={(event) =>
                                    updateRange(
                                    day.dayOfWeek,
                                    index,
                                    "end",
                                    event.target.value
                                    )
                                }
                                />
                            </label>

                            <button
                                type="button"
                                className="remove-range"
                                aria-label="Remover intervalo"
                                onClick={() =>
                                removeRange(
                                    day.dayOfWeek,
                                    index
                                )
                                }
                            >
                                <Trash2 aria-hidden="true" size={18} strokeWidth={1.8} />
                            </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-secondary add-range"
                            onClick={() =>
                            addRange(day.dayOfWeek)
                            }
                        >
                            <Plus aria-hidden="true" size={18} strokeWidth={1.8} />
                            Adicionar intervalo
                        </button>
                        </div>
                    )}
                    </div>
                ))}
            </div>
        </section>

      <div className="settings-footer">
        <p className="muted">
          Alterações de disponibilidade não
          cancelam agendamentos existentes.
        </p>

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}

        <button
          className="btn btn-primary save-button"
          onClick={handleSave}
        >
          Salvar configurações
        </button>
      </div>
    </div>
  );
}
