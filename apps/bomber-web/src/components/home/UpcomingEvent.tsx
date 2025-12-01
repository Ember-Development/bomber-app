import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUpcomingEvent } from '@/api/event';

// Countdown hook
function useCountdown(target: Date | null) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!target) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = new Date(target).getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [target]);

  return timeLeft;
}

function TimeCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="relative group">
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#57a4ff]/20 to-[#57a4ff]/30 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      <div className="relative backdrop-blur-sm bg-black/30 rounded-xl p-3 md:p-4 border border-white/10 hover:border-[#57a4ff]/50 transition-all duration-300 hover:scale-105">
        <div className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums bg-gradient-to-br from-white via-[#57a4ff] to-[#3b8aff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(87,164,255,0.5)]">
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
        <div className="rounded-xl bg-gradient-to-br from-neutral-900/90 to-black/90 px-2 py-4 md:px-4 md:py-5 lg:px-6">
          <div className="grid grid-cols-4 gap-2 md:gap-3 lg:gap-4">
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
  const { data: upcomingEvent, isLoading } = useQuery({
    queryKey: ['upcoming-event'],
    queryFn: getUpcomingEvent,
  });

  // Default event data if none found
  const defaultEvent = useMemo(
    () => ({
      title: upcomingEvent?.title || 'No Upcoming Events',
      start: upcomingEvent?.start || null,
    }),
    [upcomingEvent]
  );

  const target = useMemo(() => {
    if (!defaultEvent.start) return null;
    return new Date(defaultEvent.start);
  }, [defaultEvent.start]);

  const timeLeft = useCountdown(target);

  // Show loading state
  if (isLoading) {
    return (
      <section className="relative overflow-hidden rounded-3xl shadow-2xl mx-4 md:mx-8">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />
        <div className="relative p-10 text-white text-center">
          Loading upcoming events...
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-2xl mx-4 md:mx-8">
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
              {upcomingEvent ? 'Upcoming Event' : 'Stay Tuned'}
            </span>
          </div>

          {/* Title with gradient */}
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
            <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
              {defaultEvent.title}
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
          <CountdownPill {...timeLeft} />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-50" />
    </section>
  );
}
