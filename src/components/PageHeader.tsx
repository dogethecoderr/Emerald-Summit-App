import { type ReactNode } from 'react';

/** Eyebrow label + display title + supporting line, used atop every tab. */
export default function PageHeader({
  label,
  title,
  sub,
  actions,
}: {
  label: string;
  title: string;
  sub?: string;
  /** Optional right-aligned actions (buttons etc.). */
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-px w-6 bg-emerald-glow/70" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-mint/80">
            {label}
          </span>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {sub && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            {sub}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
