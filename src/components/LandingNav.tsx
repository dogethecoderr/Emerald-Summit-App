import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandMark from './BrandMark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SECTION_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'universes', label: 'Tracks' },
  { id: 'faq', label: 'FAQ' },
];

/**
 * Sticky marketing navbar shared by the landing page and the /app showcase.
 * "About"/"Universes" are anchors on "/" — when triggered from elsewhere
 * they route home and pass the target id via nav state, which WelcomePage
 * picks up on mount to finish the scroll.
 */
export default function LandingNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const goToSection = (id: string) => {
    setOpen(false);
    if (location.pathname === '/') {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d2a1e]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:h-20 lg:px-14">
        <BrandMark
          logoClassName="h-8 w-8 lg:h-10 lg:w-10"
          titleClassName="text-sm font-semibold tracking-tight text-white lg:text-base"
          showSubtitle={false}
          gap="gap-2.5"
        />

        <nav className="hidden items-center gap-1 md:flex">
          {SECTION_LINKS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSection(s.id)}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {s.label}
            </button>
          ))}
          <Link
            to="/app"
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10',
              location.pathname === '/app'
                ? 'text-emerald-300'
                : 'text-white/70 hover:text-white',
            )}
          >
            App
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            className="h-10 rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 hover:bg-white/90"
            onClick={() => navigate('/home')}
          >
            Sign in
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg p-2 text-white md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#0d2a1e]/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {SECTION_LINKS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSection(s.id)}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                {s.label}
              </button>
            ))}
            <Link
              to="/app"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              App
            </Link>
            <Button
              className="mt-2 h-11 w-full rounded-full bg-white text-sm font-semibold text-emerald-950 hover:bg-white/90"
              onClick={() => {
                setOpen(false);
                navigate('/home');
              }}
            >
              Sign in
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
