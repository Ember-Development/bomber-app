import { useEffect, useState, useRef } from 'react';

/** Controls the hero fullscreen mode with smooth scroll-based toggling. */
export function useFullscreenHero(): { fullscreen: boolean; toggleFullscreen: () => void } {
  const [fullscreen, setFullscreen] = useState(false);
  const lastScrollY = useRef(0);
  const wheelAccumulator = useRef(0);

  useEffect(() => {
    const el = document.documentElement;
    if (fullscreen) {
      el.style.overflow = 'hidden';
      // Scroll to top when entering fullscreen for smooth transition
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      el.style.overflow = '';
    }
    return () => {
      el.style.overflow = '';
    };
  }, [fullscreen]);

  useEffect(() => {
    // Initialize lastScrollY
    lastScrollY.current = window.scrollY;

    // Handle wheel events - works both in and out of fullscreen
    const handleWheel = (e: WheelEvent) => {
      const scrollingDown = e.deltaY > 0;
      const currentScrollY = window.scrollY;

      if (fullscreen) {
        // In fullscreen: accumulate wheel delta for smoother exit
        wheelAccumulator.current += e.deltaY;

        // Exit fullscreen after significant downward scroll
        if (wheelAccumulator.current > 50) {
          setFullscreen(false);
          wheelAccumulator.current = 0;
        }
      } else {
        // Not in fullscreen: enter on upward scroll at top
        if (!scrollingDown && currentScrollY < 50) {
          setFullscreen(true);
        }
      }
    };

    // Handle regular scroll when not in fullscreen
    const handleScroll = () => {
      if (fullscreen) return;

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

      // Only process if there's meaningful scroll movement
      if (scrollDelta < 5) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // Enter fullscreen: scroll up when near top
      if (!scrollingDown && currentScrollY < 50) {
        setFullscreen(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fullscreen]);

  const toggleFullscreen = () => setFullscreen((f) => !f);

  return { fullscreen, toggleFullscreen };
}
