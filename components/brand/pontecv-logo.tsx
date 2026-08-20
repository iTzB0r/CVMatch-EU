import Link from "next/link";

type PonteCvLogoProps = {
  showBadge?: boolean;
};

export function PonteCvLogo({ showBadge = true }: PonteCvLogoProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link
        href="/"
        className="group flex shrink-0 items-center gap-2.5"
        aria-label="PonteCV — página inicial"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
          <svg
            viewBox="0 0 44 44"
            fill="none"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="pontecv-logo-gradient"
                x1="7"
                y1="11"
                x2="37"
                y2="35"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0F2847" />
                <stop offset="1" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <path
              d="M7 29h30M10 29c4.3-11.5 19.7-11.5 24 0M12 27v8m20-8v8"
              stroke="url(#pontecv-logo-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m16.5 20.5 4 4 7.5-8"
              stroke="url(#pontecv-logo-gradient)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-xl font-extrabold tracking-[-0.04em] text-brand-navy">
          Ponte<span className="text-brand-accent">CV</span>
        </span>
      </Link>

      {showBadge && (
        <span className="hidden whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 md:inline-flex">
          Feito para Portugal e Europa
        </span>
      )}
    </div>
  );
}
