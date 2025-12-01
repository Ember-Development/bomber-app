import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { Link } from 'react-router-dom';

export default function Academy() {
  return (
    <div className="relative bg-neutral-950 min-h-screen">
      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20">
        {/* Hero Section */}
        <section className="mb-16 overflow-hidden rounded-br-3xl rounded-tr-3xl mr-8 relative shadow-2xl">
          {/* Main background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />

          {/* Image overlay */}
          <div className="absolute inset-0">
            <img
              src="https://bombersfastpitch.net/wp-content/uploads/2022/03/IMG_5804.jpg"
              alt=""
              className="h-full w-full object-cover object-center opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          </div>

          {/* Animated glow orbs */}
          <div className="absolute top-10 left-20 w-96 h-96 bg-[#57a4ff]/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 right-20 w-96 h-96 bg-[#3b8aff]/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          {/* Content */}
          <div className="relative p-6 md:p-10 lg:p-12">
            <div className="mx-auto max-w-8xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30">
                <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-[#57a4ff] uppercase">
                  Elite Training Program
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
                <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
                  BOMBERS
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(87,164,255,0.5)]">
                  ACADEMY
                </span>
              </h1>

              <p className="text-neutral-300 text-lg md:text-xl max-w-3xl mb-8 leading-relaxed">
                Our Academy program is designed for elite athletes seeking
                year-round development and competitive excellence. Experience
                professional-level training, college exposure, and a pathway to
                the next level.
              </p>

              <Link
                to="/teams?academy=true"
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300"
              >
                View Academy Teams
              </Link>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-50" />
          </div>
        </section>

        {/* What is Academy Section */}
        <section className="mb-16">
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-black text-white uppercase mb-6">
                  <span className="bg-gradient-to-r from-[#57a4ff] to-[#6bb0ff] bg-clip-text text-transparent">
                    What is Academy?
                  </span>
                </h2>
                <div className="space-y-4 text-neutral-300 text-lg leading-relaxed">
                  <p>
                    The Bombers Academy represents our highest level of
                    commitment to player development and competitive excellence.
                    Academy teams train year-round with professional coaching
                    staff and compete at the national level.
                  </p>
                  <p>
                    Unlike traditional travel ball programs, Academy teams focus
                    on long-term development, college recruitment, and building
                    championship-caliber athletes both on and off the field.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { number: '391', label: 'Academy Players' },
                  { number: '122', label: 'Academy Coaches' },
                  { number: '11', label: 'National Championships' },
                  { number: '100%', label: 'College Commits' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-neutral-900/50 backdrop-blur-sm border border-[#57a4ff]/20 rounded-xl p-6 text-center hover:border-[#57a4ff]/50 transition-all duration-300"
                  >
                    <div className="text-4xl font-black text-[#57a4ff] mb-2">
                      {stat.number}
                    </div>
                    <div className="text-neutral-400 text-sm uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Program Features */}
        <section className="mb-16">
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <h2 className="text-4xl font-black text-white uppercase mb-8 text-center">
              <span className="bg-gradient-to-r from-[#57a4ff] to-[#6bb0ff] bg-clip-text text-transparent">
                Program Features
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🏆',
                  title: 'Elite Competition',
                  description:
                    'Compete at the highest level tournaments and showcases, including Alliance, PGF, TCS, and TCS and other top events nationwide.',
                },
                {
                  icon: '📚',
                  title: 'College Recruiting',
                  description:
                    'Dedicated recruiting coordinator, exposure events, and direct relationships with college programs.',
                },
                {
                  icon: '💪',
                  title: 'Year-Round Training',
                  description:
                    'Structured training programs including strength & conditioning, skills development, and mental training.',
                },
                {
                  icon: '👥',
                  title: 'Professional Coaching',
                  description:
                    'Learn from experienced coaches with college and professional playing backgrounds.',
                },
                {
                  icon: '🥎',
                  title: 'Advanced Facilities',
                  description:
                    'Access to premier training facilities with batting cages, turf fields, and video analysis.',
                },
                {
                  icon: '🎯',
                  title: 'Individual Development',
                  description:
                    "Personalized development plans tailored to each player's goals and college aspirations.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:border-[#57a4ff]/50 transition-all duration-300 group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 uppercase">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="mb-16">
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <div className="bg-gradient-to-br from-neutral-900 via-black to-neutral-900 rounded-3xl p-8 md:p-12 border border-[#57a4ff]/20 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#57a4ff]/10 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-4xl font-black text-white uppercase mb-6">
                  <span className="bg-gradient-to-r from-[#57a4ff] to-[#6bb0ff] bg-clip-text text-transparent">
                    The Academy Commitment
                  </span>
                </h2>

                <div className="space-y-6 text-neutral-300 text-lg leading-relaxed max-w-4xl">
                  <p>
                    Academy membership requires dedication from both players and
                    families. Players commit to:
                  </p>

                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-3">
                      <span className="text-[#57a4ff] mt-1">✓</span>
                      <span>
                        Year-round participation in team practices and training
                        sessions
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#57a4ff] mt-1">✓</span>
                      <span>
                        Attendance at major national tournaments and showcase
                        events
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#57a4ff] mt-1">✓</span>
                      <span>
                        Maintaining academic excellence and NCAA eligibility
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#57a4ff] mt-1">✓</span>
                      <span>
                        Representing the Bombers organization with character and
                        integrity
                      </span>
                    </li>
                  </ul>

                  <p className="text-[#57a4ff] font-bold pt-4">
                    In return, we provide the resources, coaching, and exposure
                    needed to reach collegiate and beyond.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <div className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-[0_0_50px_rgba(87,164,255,0.3)]">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

              <div className="relative">
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4">
                  Ready to Join the Academy?
                </h2>
                <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                  Take the next step in your softball journey. View our Academy
                  teams and connect with our coaching staff.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/teams?academy=true"
                    className="px-8 py-4 bg-white text-[#57a4ff] font-black uppercase tracking-widest rounded-lg hover:bg-neutral-100 transition-all duration-300 inline-block"
                  >
                    View Teams
                  </Link>
                  <Link
                    to="/about?academy=true#coaches"
                    className="px-8 py-4 bg-black/30 text-white font-black uppercase tracking-widest rounded-lg hover:bg-black/50 transition-all duration-300 inline-block backdrop-blur-sm border border-white/20"
                  >
                    Contact Coaches
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
