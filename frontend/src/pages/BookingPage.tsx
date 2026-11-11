import { CheckCircle2, ChevronLeft, Clock3, LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useScheduling } from "../context/SchedulingContext";

const demoModalities = ["Atendimento online — demonstração", "Atendimento presencial — demonstração"];
const weekdayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function addMinutes(time: string, minutes: number) {
  const [hours, minute] = time.split(":").map(Number);
  const total = hours * 60 + minute + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function BookingPage() {
  const { appointments, availability, requestAppointment } = useScheduling();
  const [step, setStep] = useState(1);
  const [modality, setModality] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [contactAttempted, setContactAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dates = useMemo(() => Array.from({ length: 28 }, (_, index) => {
    const next = new Date();
    next.setHours(12, 0, 0, 0);
    next.setDate(next.getDate() + index + 1);
    return next;
  }), []);

  function availableSlots(dateKey: string) {
    if (!dateKey) return [];
    const day = availability.days.find((item) => item.dayOfWeek === fromDateKey(dateKey).getDay());
    if (!day?.enabled) return [];

    const occupied = new Set(
      appointments
        .filter((item) => item.date === dateKey && item.status !== "CANCELLED")
        .map((item) => item.time)
    );

    return day.ranges.flatMap((range) => {
      const slots: string[] = [];
      let current = range.start;
      while (addMinutes(current, availability.sessionDuration) <= range.end) {
        if (!occupied.has(current)) slots.push(current);
        current = addMinutes(current, availability.sessionDuration);
      }
      return slots;
    });
  }

  const selectedSlots = availableSlots(date);
  const formattedDate = date
    ? fromDateKey(date).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    : "";

  function chooseDate(nextDate: string) {
    setDate(nextDate);
    setTime("");
  }

  function submitRequest() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    requestAppointment({ patientName: name.trim(), phone: phone.trim(), date, time, modality });
    setSubmitted(true);
  }

  function continueToReview() {
    setContactAttempted(true);

    if (name.trim() && phone.trim()) {
      setStep(4);
    }
  }

  if (submitted) {
    return (
      <section className="booking-page booking-received" aria-live="polite">
        <CheckCircle2 aria-hidden="true" size={44} strokeWidth={1.6} />
        <p className="public-kicker">Solicitação recebida</p>
        <h1>Obrigada pelo seu contato.</h1>
        <p>Seu pedido para {formattedDate}, às {time}, foi enviado e aguarda a confirmação da profissional.</p>
        <p>Esse envio ainda não confirma o atendimento.</p>
        <Link className="public-button" to="/">Voltar ao início</Link>
      </section>
    );
  }

  return (
    <section className="booking-page">
      <header className="booking-intro">
        <p className="public-kicker">Solicitar horário</p>
        <h1>Vamos encontrar uma possibilidade de encontro.</h1>
        <p>Você enviará uma solicitação. A confirmação do atendimento acontece somente após o retorno da profissional.</p>
      </header>

      <ol className="booking-progress" aria-label="Etapas da solicitação">
        {["Modalidade", "Horário", "Contato", "Revisão"].map((label, index) => (
          <li key={label} className={step >= index + 1 ? "active" : ""} aria-current={step === index + 1 ? "step" : undefined}>
            <span>{index + 1}</span>{label}
          </li>
        ))}
      </ol>

      <div className="booking-card">
        {step === 1 && (
          <fieldset className="booking-fieldset">
            <legend>Como você prefere ser atendido?</legend>
            <p className="booking-help">Modalidades de demonstração: confirme as opções reais antes de publicar o site.</p>
            <div className="modality-options">
              {demoModalities.map((option) => (
                <label key={option} className={`modality-option ${modality === option ? "selected" : ""}`}>
                  <input type="radio" name="modality" value={option} checked={modality === option} onChange={() => setModality(option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <button className="public-button" type="button" disabled={!modality} onClick={() => setStep(2)}>Continuar</button>
          </fieldset>
        )}

        {step === 2 && (
          <div>
            <h2>Escolha uma data e horário</h2>
            <p className="booking-help">Os horários já solicitados ou confirmados não aparecem como disponíveis.</p>
            <div className="booking-calendar" aria-label="Datas disponíveis nas próximas quatro semanas">
              {weekdayLabels.map((label, index) => <span className="booking-weekday" key={`${label}-${index}`}>{label}</span>)}
              {Array.from({ length: dates[0].getDay() }, (_, index) => (
                <span className="booking-calendar-blank" aria-hidden="true" key={`blank-${index}`} />
              ))}
              {dates.map((item) => {
                const key = toDateKey(item);
                const slots = availableSlots(key);
                return (
                  <button key={key} type="button" className={`booking-date ${date === key ? "selected" : ""}`} disabled={slots.length === 0} onClick={() => chooseDate(key)} aria-pressed={date === key}>
                    <span>{item.getDate()}</span>
                    <small>{slots.length ? "disponível" : "indisponível"}</small>
                  </button>
                );
              })}
            </div>
            {date && (
              <div className="time-selection">
                <h3>{formattedDate}</h3>
                {selectedSlots.length ? (
                  <div className="time-options">
                    {selectedSlots.map((slot) => <button type="button" key={slot} className={time === slot ? "selected" : ""} onClick={() => setTime(slot)} aria-pressed={time === slot}><Clock3 aria-hidden="true" size={16} />{slot}</button>)}
                  </div>
                ) : <p className="booking-empty">Não há horários disponíveis nesta data.</p>}
              </div>
            )}
            <div className="booking-actions"><button type="button" className="text-button" onClick={() => setStep(1)}><ChevronLeft aria-hidden="true" size={18} /> Voltar</button><button className="public-button" type="button" disabled={!date || !time} onClick={() => setStep(3)}>Continuar</button></div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Como podemos entrar em contato?</h2>
            <p className="booking-help"><LockKeyhole aria-hidden="true" size={16} /> Pedimos apenas o necessário para retornar sua solicitação.</p>
            <div className="booking-fields">
              <label htmlFor="patient-name">Nome
                <input
                  id="patient-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  aria-invalid={contactAttempted && !name.trim()}
                  aria-describedby={contactAttempted && !name.trim() ? "patient-name-error" : undefined}
                />
                {contactAttempted && !name.trim() && <span id="patient-name-error" className="field-error">Informe seu nome para continuar.</span>}
              </label>
              <label htmlFor="patient-phone">Telefone ou WhatsApp
                <input
                  id="patient-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  aria-invalid={contactAttempted && !phone.trim()}
                  aria-describedby={contactAttempted && !phone.trim() ? "patient-phone-error" : undefined}
                />
                {contactAttempted && !phone.trim() && <span id="patient-phone-error" className="field-error">Informe um telefone para contato.</span>}
              </label>
            </div>
            <div className="booking-actions"><button type="button" className="text-button" onClick={() => setStep(2)}><ChevronLeft aria-hidden="true" size={18} /> Voltar</button><button className="public-button" type="button" onClick={continueToReview}>Revisar solicitação</button></div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2>Revise sua solicitação</h2>
            <dl className="booking-summary"><div><dt>Modalidade</dt><dd>{modality}</dd></div><div><dt>Data</dt><dd>{formattedDate}</dd></div><div><dt>Horário</dt><dd>{time}</dd></div><div><dt>Nome</dt><dd>{name}</dd></div></dl>
            <p className="booking-help">Ao enviar, sua solicitação ficará pendente até a confirmação da profissional.</p>
            <div className="booking-actions"><button type="button" className="text-button" onClick={() => setStep(3)}><ChevronLeft aria-hidden="true" size={18} /> Voltar</button><button className="public-button" type="button" disabled={isSubmitting} onClick={submitRequest}>{isSubmitting ? "Enviando..." : "Enviar solicitação"}</button></div>
          </div>
        )}
      </div>
    </section>
  );
}
