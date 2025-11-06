import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from '@/components/ui/icons';
import { useFullscreenHero } from '@/hooks/useFullScreenHero';

export default function Hero() {
  const { fullscreen, toggleFullscreen } = useFullscreenHero();
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 200], [1, 0.9]);

  return (
    <motion.section
      style={{ opacity: fullscreen ? 1 : fade }}
      className={`hidden md:block relative w-full overflow-hidden transition-all duration-700 ${
        fullscreen ? 'fixed inset-0 z-[100] h-screen' : 'h-[100svh] z-0'
      }`}
    >
      {/* background video */}
      <video
        src="/videos/bomberhero.mp4"
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* dark film overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25),transparent_65%)]" />

      {/* overlay content */}
      <motion.div
        animate={{ opacity: fullscreen ? 0 : 1, y: fullscreen ? -50 : 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center select-none"
      >
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-3 text-4xl font-semibold tracking-wide text-white/85 md:text-6xl lg:text-7xl"
        >
          Bombers Fastpitch
        </motion.h2>

        {/* MAIN FOCUS: animated gradient text (no blue block) */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-5 text-center font-black leading-[0.95]"
        >
          <span
            className="inline-block bg-clip-text text-transparent
               text-[clamp(2.75rem,10vw,9rem)] tracking-tight"
            style={{
              background:
                'linear-gradient(270deg,#60a5fa,#93c5fd,#a5b4fc,#3b82f6,#60a5fa)',
              backgroundSize: '400% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', // fixes Safari/Chrome
              animation: 'flowGradient 8s ease-in-out infinite',
            }}
          >
            #BLUEBLOODS
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-xl font-medium text-white/85 md:text-3xl lg:text-4xl"
        >
          Building champions since <span className="text-white">2001</span>
        </motion.p>
      </motion.div>

      {/* fullscreen exit */}
      {fullscreen && (
        <div className="relative z-20 flex h-full items-end justify-center pb-10">
          <button
            onClick={toggleFullscreen}
            className="rounded-full border border-white/35 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-110"
            aria-label="Exit immersive hero"
          >
            <ArrowDown className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* keyframes for flowing gradient */}
      <style>{`
        @keyframes flowGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </motion.section>
  );
}
