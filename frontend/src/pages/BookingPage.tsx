import { CheckCircle2, ChevronLeft, Clock3, LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, publicApi } from "../services/api";
import type { AppointmentModality, AppointmentResponse, ServiceResponse } from "../types/api";

const weekdayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
const modalities: { value: AppointmentModality; label: string }[] = [{ value: "REMOTE", label: "Atendimento remoto" }, { value: "IN_PERSON", label: "Atendimento presencial" }];
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const readableDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const readableTime = (value: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
const readableAppointmentDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", weekday: "long", day: "numeric", month: "long" }).format(new Date(value));

export default function BookingPage() {
  const [step, setStep] = useState(1); const [services, setServices] = useState<ServiceResponse[]>([]); const [serviceId, setServiceId] = useState<number | null>(null); const [modality, setModality] = useState<AppointmentModality | "">("");
  const [date, setDate] = useState(""); const [startsAt, setStartsAt] = useState(""); const [availableStarts, setAvailableStarts] = useState<string[]>([]);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [submitted, setSubmitted] = useState(false); const [createdAppointment, setCreatedAppointment] = useState<AppointmentResponse | null>(null); const [contactAttempted, setContactAttempted] = useState(false); const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true); const [loadingSlots, setLoadingSlots] = useState(false); const [error, setError] = useState("");
  const dates = useMemo(() => Array.from({ length: 28 }, (_, index) => { const next = new Date(); next.setHours(12, 0, 0, 0); next.setDate(next.getDate() + index + 1); return next; }), []);
  const selectedService = services.find((item) => item.id === serviceId);

  useEffect(() => { void (async () => { try { setServices(await publicApi.services()); } catch { setError("Não foi possível carregar as opções de atendimento."); } finally { setLoadingServices(false); } })(); }, []);
  async function chooseDate(nextDate: string) {
    if (!serviceId) return; setDate(nextDate); setStartsAt(""); setAvailableStarts([]); setLoadingSlots(true); setError("");
    try { setAvailableStarts((await publicApi.availability(nextDate, serviceId)).availableStarts); } catch { setError("Não foi possível consultar os horários desta data."); } finally { setLoadingSlots(false); }
  }
  async function submitRequest() {
    if (isSubmitting || !serviceId || !modality || !startsAt) return;
    setIsSubmitting(true); setError("");
    try {
      const created = await publicApi.createAppointment({ serviceId, clientName: name.trim(), clientPhone: phone.trim(), modality, location: null, startsAt });
      if (Number.isNaN(Date.parse(created.startsAt))) throw new Error("Invalid appointment start returned by API");
      setCreatedAppointment(created);
      setAvailableStarts((current) => current.filter((slot) => slot !== created.startsAt));
      setSubmitted(true);
    }
    catch (exception) { setError(exception instanceof ApiError && exception.status === 409 ? "Este horário acabou de ser ocupado. Escolha outra opção." : "Não foi possível enviar a solicitação. Tente novamente."); }
    finally { setIsSubmitting(false); }
  }
  function continueToReview() { setContactAttempted(true); if (name.trim() && phone.trim()) setStep(4); }

  if (submitted && createdAppointment) return <section className="booking-page booking-received" aria-live="polite"><CheckCircle2 aria-hidden="true" size={44} strokeWidth={1.6} /><p className="public-kicker">Solicitação recebida</p><h1>Obrigada pelo seu contato.</h1><p>Sua solicitação de {createdAppointment.serviceName} para {readableAppointmentDate(createdAppointment.startsAt)}, às {readableTime(createdAppointment.startsAt)}, foi registrada.</p><p>Ela está pendente de confirmação administrativa e ainda não confirma o atendimento.</p><Link className="public-button" to="/">Voltar ao início</Link></section>;
  return <section className="booking-page"><header className="booking-intro"><p className="public-kicker">Solicitar horário</p><h1>Vamos encontrar uma possibilidade de encontro.</h1><p>Você enviará uma solicitação. A confirmação acontece somente após o retorno da profissional.</p></header>
    <ol className="booking-progress" aria-label="Etapas da solicitação">{["Atendimento", "Horário", "Contato", "Revisão"].map((label, index) => <li key={label} className={step >= index + 1 ? "active" : ""} aria-current={step === index + 1 ? "step" : undefined}><span>{index + 1}</span>{label}</li>)}</ol>
    <div className="booking-card">
      {step === 1 && <fieldset className="booking-fieldset"><legend>Escolha o atendimento</legend>{loadingServices ? <p className="booking-help">Carregando opções...</p> : services.length === 0 ? <p className="booking-empty">Não há atendimentos disponíveis no momento.</p> : <><div className="modality-options">{services.map((item) => <label key={item.id} className={`modality-option ${serviceId === item.id ? "selected" : ""}`}><input type="radio" name="service" checked={serviceId === item.id} onChange={() => setServiceId(item.id)} /><span>{item.name}<small>{item.durationMinutes} minutos</small></span></label>)}</div><p className="booking-help">Modalidade</p><div className="modality-options">{modalities.map((item) => <label key={item.value} className={`modality-option ${modality === item.value ? "selected" : ""}`}><input type="radio" name="modality" checked={modality === item.value} onChange={() => setModality(item.value)} /><span>{item.label}</span></label>)}</div><button className="public-button" type="button" disabled={!serviceId || !modality} onClick={() => setStep(2)}>Continuar</button></>}</fieldset>}
      {step === 2 && <div><h2>Escolha uma data e horário</h2><p className="booking-help">A disponibilidade é consultada em tempo real para o atendimento escolhido.</p><div className="booking-calendar" aria-label="Datas para consulta"><>{weekdayLabels.map((label, index) => <span className="booking-weekday" key={`${label}-${index}`}>{label}</span>)}{Array.from({ length: dates[0].getDay() }, (_, index) => <span className="booking-calendar-blank" aria-hidden="true" key={`blank-${index}`} />)}{dates.map((item) => { const key = dateKey(item); return <button key={key} type="button" className={`booking-date ${date === key ? "selected" : ""}`} onClick={() => void chooseDate(key)} aria-pressed={date === key}><span>{item.getDate()}</span><small>consultar</small></button>; })}</></div>{date && <div className="time-selection"><h3>{readableDate(date)}</h3>{loadingSlots ? <p className="booking-help">Consultando horários...</p> : availableStarts.length ? <div className="time-options">{availableStarts.map((slot) => <button type="button" key={slot} className={startsAt === slot ? "selected" : ""} onClick={() => setStartsAt(slot)} aria-pressed={startsAt === slot}><Clock3 aria-hidden="true" size={16} />{readableTime(slot)}</button>)}</div> : <p className="booking-empty">Não há horários disponíveis nesta data.</p>}</div>}<div className="booking-actions"><button type="button" className="text-button" onClick={() => setStep(1)}><ChevronLeft aria-hidden="true" size={18} /> Voltar</button><button className="public-button" type="button" disabled={!date || !startsAt} onClick={() => setStep(3)}>Continuar</button></div></div>}
      {step === 3 && <div><h2>Como podemos entrar em contato?</h2><p className="booking-help"><LockKeyhole aria-hidden="true" size={16} /> Pedimos apenas o necessário para retornar sua solicitação.</p><div className="booking-fields"><label htmlFor="patient-name">Nome<input id="patient-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" aria-invalid={contactAttempted && !name.trim()} />{contactAttempted && !name.trim() && <span className="field-error">Informe seu nome para continuar.</span>}</label><label htmlFor="patient-phone">Telefone ou WhatsApp<input id="patient-phone" type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" aria-invalid={contactAttempted && !phone.trim()} />{contactAttempted && !phone.trim() && <span className="field-error">Informe um telefone para contato.</span>}</label></div><div className="booking-actions"><button type="button" className="text-button" onClick={() => setStep(2)}><ChevronLeft aria-hidden="true" size={18} /> Voltar</button><button className="public-button" type="button" onClick={continueToReview}>Revisar solicitação</button></div></div>}
      {step === 4 && <div><h2>Revise sua solicitação</h2><dl className="booking-summary"><div><dt>Atendimento</dt><dd>{selectedService?.name}</dd></div><div><dt>Modalidade</dt><dd>{modalities.find((item) => item.value === modality)?.label}</dd></div><div><dt>Data</dt><dd>{readableDate(date)}</dd></div><div><dt>Horário</dt><dd>{readableTime(startsAt)}</dd></div><div><dt>Nome</dt><dd>{name}</dd></div></dl><p className="booking-help">Ao enviar, sua solicitação ficará pendente até a confirmação da profissional.</p>{error && <p className="field-error" role="alert">{error}</p>}<div className="booking-actions"><button type="button" className="text-button" onClick={() => setStep(3)}><ChevronLeft aria-hidden="true" size={18} /> Voltar</button><button className="public-button" type="button" disabled={isSubmitting} onClick={() => void submitRequest()}>{isSubmitting ? "Enviando..." : "Enviar solicitação"}</button></div></div>}
      {error && step !== 4 && <p className="field-error" role="alert">{error}</p>}
    </div></section>;
}
