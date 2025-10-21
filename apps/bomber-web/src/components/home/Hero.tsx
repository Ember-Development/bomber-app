import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUp } from '@/components/ui/icons';
import { useFullscreenHero } from '@/hooks/useFullScreenHero';

export default function Hero() {
  const { fullscreen, toggleFullscreen } = useFullscreenHero();
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 200], [1, 0.88]);

  return (
    <motion.section
      style={{ opacity: fullscreen ? 1 : fade }}
      className={`relative w-full overflow-hidden transition-all duration-700 ${
        fullscreen ? 'fixed inset-0 z-[100] h-screen' : 'h-[100svh]'
      }`}
    >
      <video
        src="/videos/bomberhero.mp4"
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* filmic darkening only - removed the bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/50" />

      {/* content sits in lower third; restrained, bold */}

      {/* immersive mode: only down arrow */}
      {fullscreen && (
        <div className="relative z-20 flex h-full items-end justify-center pb-10">
          <button
            onClick={toggleFullscreen}
            className="rounded-full border border-white/35 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
            aria-label="Exit immersive hero"
          >
            <ArrowDown className="h-6 w-6" />
          </button>
        </div>
      )}
    </motion.section>
  );
}
