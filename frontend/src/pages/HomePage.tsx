import { ArrowRight, CalendarDays, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import professionalPhoto from "../assets/professional-photo.png";
import professionalHeroPhoto from "../assets/professional-photo1.png";

export default function HomePage() {
  return (
    <>
      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-kicker">Psicanálise</p>
          <h1>Um espaço para olhar com calma para o que importa.</h1>
          <p className="public-lead">A escuta psicanalítica oferece um tempo reservado para falar, elaborar e construir novos sentidos para a própria experiência.</p>
          <Link className="public-button" to="/agendar">
            Solicitar um horário <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <p className="public-note">A solicitação será analisada antes da confirmação do atendimento.</p>
        </div>
        <figure className="hero-quiet-panel hero-photo-panel">
          <img
            src={professionalHeroPhoto}
            alt="Retrato da profissional"
          />
        </figure>
      </section>

      <section className="public-section public-about" id="sobre">
        <figure className="professional-portrait">
          <img
            src={professionalPhoto}
            alt="Retrato da profissional"
          />
        </figure>
        <div className="public-section-copy">
          <p className="public-kicker">Sobre a profissional</p>
          <h2>Uma presença atenta para o seu processo.</h2>
          <p><strong>Texto institucional provisório — revisar com a profissional.</strong> Este espaço pode apresentar sua trajetória, a forma como conduz os atendimentos e aquilo que considera importante no vínculo clínico.</p>
          <p>O conteúdo final deve ser construído a partir das informações reais sobre sua prática, sem antecipar formações, títulos ou especializações.</p>
        </div>
      </section>

      <section className="public-section public-care" id="atendimentos">
        <div className="public-section-copy">
          <p className="public-kicker">Atendimentos</p>
          <h2>Começar pode ser um gesto simples.</h2>
          <p>A psicanálise se organiza pela conversa e pela singularidade de cada pessoa. O primeiro contato serve para compreender a possibilidade de um encontro e combinar os próximos passos.</p>
          <p>As modalidades exibidas no agendamento são demonstrativas e devem ser atualizadas conforme os atendimentos realmente oferecidos.</p>
        </div>
        <div className="care-points">
          <article>
            <MessageCircle aria-hidden="true" size={21} strokeWidth={1.8} />
            <h3>Escuta reservada</h3>
            <p>Um espaço de conversa com discrição e respeito ao seu ritmo.</p>
          </article>
          <article>
            <CalendarDays aria-hidden="true" size={21} strokeWidth={1.8} />
            <h3>Solicitação simples</h3>
            <p>Você escolhe uma possibilidade de horário e recebe o retorno da profissional.</p>
          </article>
          <article>
            <ShieldCheck aria-hidden="true" size={21} strokeWidth={1.8} />
            <h3>Privacidade</h3>
            <p>O formulário pede apenas as informações necessárias para o contato inicial.</p>
          </article>
        </div>
      </section>

      <section className="public-booking-callout">
        <p className="public-kicker">Agendamento</p>
        <h2>Escolha um horário para solicitar seu atendimento.</h2>
        <p>O envio não confirma a sessão automaticamente. A profissional retornará para confirmar a disponibilidade.</p>
        <Link className="public-button public-button-light" to="/agendar">Iniciar solicitação <ArrowRight aria-hidden="true" size={18} /></Link>
      </section>
    </>
  );
}
