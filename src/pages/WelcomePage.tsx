import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SummitLogo from '../components/SummitLogo';
import './WelcomePage.css';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome">
      <div className="welcome__glow welcome__glow--top" />
      <div className="welcome__glow welcome__glow--bottom" />

      <div className="welcome__content">
        <div className="welcome__spacer welcome__spacer--top" />

        <div className="welcome__logo" aria-hidden>
          <SummitLogo background="none" iconColor="var(--white)" />
        </div>

        <h1 className="welcome__title">Emerald Summit</h1>
        <p className="welcome__subtitle">EHS Academic Foundation</p>

        <div className="welcome__badge">
          Summit '27 · January 2027 · Dublin, CA
        </div>

        <div className="welcome__spacer welcome__spacer--bottom" />

        <p className="welcome__blurb">
          Build your schedule, check in on the day, and follow along — all in
          one place.
        </p>

        <button
          className="btn-filled welcome__cta"
          onClick={() => navigate('/home')}
        >
          Get Started <ArrowRight size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
