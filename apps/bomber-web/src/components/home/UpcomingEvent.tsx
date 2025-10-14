import { useMemo } from 'react';

// Mock countdown hook for demo
function useCountdown(target: Date) {
  return { days: 7, hours: 14, minutes: 32, seconds: 45 };
}

function TimeCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="relative group">
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#57a4ff]/20 to-[#57a4ff]/30 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      <div className="relative backdrop-blur-sm bg-black/30 rounded-xl p-4 border border-white/10 hover:border-[#57a4ff]/50 transition-all duration-300 hover:scale-105">
        <div className="text-4xl md:text-5xl font-black tabular-nums bg-gradient-to-br from-white via-[#57a4ff] to-[#3b8aff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(87,164,255,0.5)]">
          {String(value).padStart(2, '0')}
        </div>
        <div className="mt-2 text-[9px] md:text-[10px] font-black tracking-[0.2em] text-[#57a4ff]/90 uppercase">
          {label}
        </div>
      </div>
    </div>
  );
}

function CountdownPill({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return (
    <div className="relative">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#57a4ff] via-[#3b8aff] to-[#57a4ff] rounded-2xl opacity-30 blur-2xl animate-pulse" />

      <div className="relative rounded-2xl bg-gradient-to-br from-black/60 to-black/40 p-1 backdrop-blur-xl">
        <div className="rounded-xl bg-gradient-to-br from-neutral-900/90 to-black/90 px-4 py-5 md:px-6">
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            <TimeCell label="DAYS" value={days} />
            <TimeCell label="HRS" value={hours} />
            <TimeCell label="MINS" value={minutes} />
            <TimeCell label="SECS" value={seconds} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpcomingEvent() {
  const target = useMemo(() => new Date(Date.now() + 7 * 24 * 3600 * 1000), []);
  const diff = useCountdown(target);

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-2xl mx-8">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />

      {/* Animated overlay patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#57a4ff]/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#3b8aff]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
        }}
      />

      {/* Content */}
      <div className="relative grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10 lg:p-12">
        <div className="space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30">
            <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#57a4ff] uppercase">
              Upcoming Event
            </span>
          </div>

          {/* Title with gradient */}
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
            <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
              2024 BOMBERS
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(87,164,255,0.5)]">
              NATIONAL COACHES CONVENTION
            </span>
          </h3>

          {/* Links with hover effects */}
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#"
              className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] font-bold text-sm uppercase tracking-wider text-white shadow-lg shadow-[#57a4ff]/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#57a4ff]/70"
            >
              <span>Register Now</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>

            <a
              href="#"
              className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 font-bold text-sm uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-[#57a4ff]/50 hover:bg-white/5 hover:scale-105"
            >
              <span>Event Info</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Countdown */}
        <div className="justify-self-end">
          <CountdownPill {...diff} />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-50" />
    </section>
  );
}
