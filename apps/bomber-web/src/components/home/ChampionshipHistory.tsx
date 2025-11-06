import { Link } from 'react-router-dom';
import { History, Star, GraduationCap } from 'lucide-react';
import type { ComponentType } from 'react';

type IconType = ComponentType<{ className?: string }>;

function InfoCard({
  title,
  icon: Icon,
  to,
}: {
  title: string;
  icon: IconType;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col rounded-2xl overflow-hidden min-h-[300px]"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#57a4ff]/30 via-[#3b8aff]/20 to-black/40 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#57a4ff]/40 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      {/* Border gradient */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-[#57a4ff]/50 transition-colors duration-300" />

      {/* Content */}
      <div className="relative flex flex-col h-full p-6 backdrop-blur-sm">
        {/* Icon and title */}
        <div className="flex items-center gap-4 mb-auto">
          <div className="relative h-16 w-16 rounded-2xl bg-neutral-800/60 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:scale-105 group-hover:border-white/30 transition-all duration-300">
            <Icon className="w-7 h-7 text-neutral-200 group-hover:text-white transition-colors duration-300" />
          </div>
          <h4 className="text-2xl font-black bg-gradient-to-br from-white to-neutral-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-[#57a4ff] transition-all duration-300">
            {title}
          </h4>
        </div>

        {/* Description */}
        <p className="mt-6 text-sm/6 text-neutral-300 group-hover:text-white transition-colors duration-300">
          Take a trip down memory lane! Click through the years and celebrate
          these incredible journeys and achievements.
        </p>

        {/* Arrow indicator */}
        <div className="mt-4 flex items-center gap-2 text-[#57a4ff] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="text-sm font-bold uppercase tracking-wider">
            Explore
          </span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
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
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </Link>
  );
}

export default function ChampionshipHistory() {
  return (
    <section className="overflow-hidden rounded-br-3xl rounded-tr-3xl mr-4 md:mr-8 mt-[3rem] relative shadow-2xl">
      {/* Main background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />

      {/* Image overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920"
          alt=""
          className="h-full w-full object-cover object-top opacity-20"
        />
        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Animated glow orbs */}
      <div className="absolute top-10 left-4 md:left-20 w-64 md:w-96 h-64 md:h-96 bg-[#57a4ff]/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-10 right-4 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-[#3b8aff]/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Content */}
      <div className="relative grid gap-6 p-6 md:grid-cols-4 md:p-10 lg:p-12">
        {/* Title section */}
        <div className="md:col-span-1 flex flex-col justify-center group">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 w-fit rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-[#57a4ff] uppercase">
              Championship & History
            </span>
          </div>

          <h3 className="max-w-xs text-4xl lg:text-5xl font-black leading-tight">
            <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
              Building
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(87,164,255,0.5)]">
              Champions
            </span>
            <br />
            <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
              Since 2001
            </span>
          </h3>

          {/* Decorative line */}
          <div className="mt-6 h-1 w-20 bg-gradient-to-r from-[#57a4ff] to-transparent rounded-full" />
        </div>

        {/* Info cards */}
        <InfoCard title="Bomber History" icon={History} to="/history" />
        <InfoCard title="Recent Commitments" icon={Star} to="/commitments" />
        <InfoCard title="Bombers Alumni" icon={GraduationCap} to="/alumnis" />
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-50" />
    </section>
  );
}
