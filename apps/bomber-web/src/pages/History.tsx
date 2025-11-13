import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const TIMELINE_EVENTS = [
  {
    year: '2001',
    title: 'The Beginning',
    description:
      'The Bomber Fastpitch program was established in 2001 with a 10U All-Star team based out of New Braunfels, TX. Eight years later in 2009, we had grown to 8 teams and saw our first two seniors commit to play college softball.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/bombers1.jpeg',
    highlight: '8 Teams',
  },
  {
    year: '2011',
    title: 'National Expansion & Depth',
    description:
      'In 2011, the program expanded to 15 teams, adding players and squads from North, South, and East Texas. We began rising in rankings and finishing at national tournaments.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/bombers2.jpg',
    highlight: '15 Teams',
  },
  {
    year: '2012-13',
    title: 'From Texas to National',
    description:
      'In 2012-14 we added our first non-Texas team from Louisiana followed by Arizona. By 2013 our program had grown to 30 teams with additions from Arkansas, Oklahoma, Mississippi and Colorado.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/IMG_7949.jpg',
    highlight: '30 Teams',
  },
  {
    year: '2014',
    title: 'Training Facility Opens',
    description:
      'We opened our first training facility in 2014 and added staff to enhance recruiting and player development. This transformed the program into a top-ranked national powerhouse.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/bombers3.jpeg',
    highlight: 'First Facility',
  },
  {
    year: '2017',
    title: 'Growth + Consistency + Success',
    description:
      'By 2017, our program ranked in the top 10 nationally with over 70 teams in 12 states and our 600th senior committed to play college softball.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/bombers4-300x168.jpg',
    highlight: '70 Teams',
  },
  {
    year: '2021',
    title: '20 Years of Excellence',
    description:
      '2021 marked our 20th anniversary: 162 teams in 28 states, 1944 Bomber players, 405 Bomber coaches, and our 1000th player committed to college. Our 18U National ranked #1, 16U National #3, 14U National #2. We lead in analytics and data metrics to boost performance.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/20th_300DPI-1-300x210.png',
    highlight: '1000+ Commits',
  },
];

export default function History() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);

  const currentEvent = TIMELINE_EVENTS[currentIndex];

  const handlePrevious = () => {
    if (isAnimating) return;
    setDirection('prev');
    setIsAnimating(true);
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : TIMELINE_EVENTS.length - 1
    );
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setDirection('next');
    setIsAnimating(true);
    setCurrentIndex((prev) =>
      prev < TIMELINE_EVENTS.length - 1 ? prev + 1 : 0
    );
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToIndex = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setDirection(index > currentIndex ? 'next' : 'prev');
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnimating]);

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      <MainNav />
      <SocialSidebar />

      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(87,164,255,0.1),transparent_50%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-screen pt-20 lg:pt-0">
        {/* LEFT PANEL - Image & Year */}
        <div className="relative h-[50vh] lg:h-screen overflow-hidden">
          {/* Background Image with parallax effect */}
          <div className="absolute inset-0">
            <div
              className={`absolute inset-0 transition-all duration-700 ${
                isAnimating
                  ? direction === 'next'
                    ? 'translate-x-full opacity-0'
                    : '-translate-x-full opacity-0'
                  : 'translate-x-0 opacity-100'
              }`}
            >
              <img
                src={currentEvent.imageUri}
                alt={currentEvent.title}
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-[#57a4ff]/20" />
            </div>
          </div>

          {/* Floating year badge */}
          {/* <div className="absolute top-18 left-8 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-[#57a4ff] blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-[#57a4ff] to-blue-600 px-8 py-4 rounded-2xl border-4 border-white/20 shadow-2xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-white" />
                  <span className="text-5xl font-black text-white tracking-tight">
                    {currentEvent.year}
                  </span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Title overlay - animated */}
          <div className="absolute inset-0 flex items-center justify-center px-8 lg:px-16">
            <div
              className={`transition-all duration-700 ${
                isAnimating
                  ? direction === 'next'
                    ? '-translate-y-12 opacity-0 blur-sm'
                    : 'translate-y-12 opacity-0 blur-sm'
                  : 'translate-y-0 opacity-100 blur-0'
              }`}
            >
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase text-center leading-none mb-6 drop-shadow-2xl">
                {currentEvent.title.split(' ').map((word, i) => (
                  <span
                    key={i}
                    className="block"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animation: isAnimating
                        ? 'none'
                        : 'slideUp 0.6s ease-out backwards',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </h2>

              {/* Highlight stat badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3">
                  <TrendingUp className="w-5 h-5 text-[#57a4ff]" />
                  <span className="text-xl font-bold text-white">
                    {currentEvent.highlight}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline dots - bottom */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3">
            {TIMELINE_EVENTS.map((event, index) => (
              <button
                key={event.year}
                onClick={() => goToIndex(index)}
                className={`group relative transition-all duration-300 ${
                  index === currentIndex ? 'scale-125' : 'hover:scale-110'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-[#57a4ff] shadow-lg shadow-[#57a4ff]/50'
                      : 'bg-white/30 group-hover:bg-white/60'
                  }`}
                ></div>
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-[#57a4ff] rounded-full animate-ping opacity-75"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Content */}
        <div className="relative bg-gradient-to-br from-neutral-950 to-black flex flex-col justify-between p-8 lg:p-16 min-h-[50vh] lg:min-h-screen">
          {/* Navigation */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-neutral-500 text-sm uppercase tracking-wider font-semibold">
              {currentIndex + 1} / {TIMELINE_EVENTS.length}
            </div>

            <div className="flex items-center mt-4 gap-3">
              <button
                onClick={handlePrevious}
                disabled={isAnimating}
                className="group relative w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#57a4ff]/50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:text-[#57a4ff] transition-colors" />
              </button>
              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="group relative w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#57a4ff]/50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:text-[#57a4ff] transition-colors" />
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex items-center">
            <div
              className={`transition-all duration-700 ${
                isAnimating
                  ? direction === 'next'
                    ? 'translate-x-12 opacity-0'
                    : '-translate-x-12 opacity-0'
                  : 'translate-x-0 opacity-100'
              }`}
            >
              <p className="text-2xl md:text-3xl lg:text-4xl text-neutral-200 leading-relaxed font-light">
                {currentEvent.description}
              </p>
            </div>
          </div>

          {/* Bottom section - Year navigation */}
          <div className="mt-12">
            <div className="text-neutral-500 text-xs uppercase tracking-widest mb-4 font-semibold">
              Jump to Year
            </div>
            <div className="flex flex-wrap gap-3">
              {TIMELINE_EVENTS.map((event, index) => (
                <button
                  key={event.year}
                  onClick={() => goToIndex(index)}
                  className={`group relative px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-[#57a4ff] to-blue-600 text-white shadow-lg shadow-[#57a4ff]/30 scale-105'
                      : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {event.year}
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-[#57a4ff] rounded-lg blur-xl opacity-30 -z-10"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pro tip */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600 text-sm">
              Use{' '}
              <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">
                ←
              </kbd>{' '}
              <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">
                →
              </kbd>{' '}
              to navigate
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
