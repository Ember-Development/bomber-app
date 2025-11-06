import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { fetchCoaches } from '@/api/coach';
import {
  Search,
  MapPin,
  Mail,
  ChevronDown,
  Users,
  Award,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ADMINISTRATION_TEAM = [
  {
    id: 'scott',
    name: 'Scott Smith',
    role: 'CEO / President / Head Coach - 18U Gold',
    image:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Scott-Smith-scaled-landscape-e56529274e6452b73edfc3d53bbaea3e-5f90a34246c8e.jpg',
    bio: 'Scott oversees the entire program. As our head coach, he has guided multiple teams to national championships.',
  },
  {
    id: 'bo',
    name: 'Bo Vinton',
    role: 'Chief Operating Officer/Executive Vice President',
    image:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Bo-Vinton-scaled-landscape-3aa2faa3a59fec1219804926fbd3a33f-5f90a34246c8e.jpg',
    bio: 'Bo heads up our player development curriculum and mentors each coach on the staff.',
  },
  {
    id: 'david',
    name: 'David McCorkle',
    role: 'Assistant Program Director/Vice President',
    image:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/David-McCorkle-scaled-landscape-5c5db9ae467f5c088d903022b57fd88f-5f90a34246c8e.jpg',
    bio: 'David leads the 16U Platinum squad and specializes in defensive strategy.',
  },
  {
    id: 'Kevin',
    name: 'Kevin Mills',
    role: 'Chief Financial Officer',
    image: '/src/assets/bomber-icon-blue.png',

    bio: 'Jennifer focuses on infield development and works closely with our middle‐school camps.',
  },
  {
    id: 'noe',
    name: 'Noe Saucedo',
    role: 'Chief Legal Officer',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Christy leads our marketing and brand initiatives, creating compelling content.',
  },
  {
    id: 'jennifer',
    name: 'Jennifer Vinton',
    role: 'Director of Operations',
    image:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Jennifer-Vinton-scaled-landscape-078f9bfeb75e201aab6137dde8943af5-5f90a34246c8e.jpg',
    bio: 'Jennifer focuses on infield development and works closely with our middle‐school camps.',
  },
  {
    id: 'allison',
    name: 'Allison Honkofsky',
    role: 'Director of Recuriting',
    image: '/src/assets/bomber-icon-blue.png',

    bio: 'Jade oversees all digital media and content creation.',
  },
  {
    id: 'Brian',
    name: 'Brain Repole',
    role: 'Assistant Director of Recuriting',
    image: '/src/assets/bomber-icon-blue.png',

    bio: 'Jennifer focuses on infield development and works closely with our middle‐school camps.',
  },
  {
    id: 'christy',
    name: 'Christy Connor',
    role: 'Director of Brand Development',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Christy leads our marketing and brand initiatives, creating compelling content.',
  },
  {
    id: 'jade',
    name: 'Jade Nottebrok',
    role: 'Media Director',
    image:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Jade-Nottebrok-scaled-landscape-6d6f7a877b9ffb01e55b7fb63dd7d2d9-5f90a34246c8e.jpg',
    bio: 'Jade oversees all digital media and content creation.',
  },
  {
    id: 'Kristi',
    name: 'Kristi Malpass',
    role: 'Training Coordinator',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Christy leads our marketing and brand initiatives, creating compelling content.',
  },
  {
    id: 'Cat',
    name: 'Cat Osterman',
    role: 'Pitching Performance Coordinator',
    image: '/src/assets/bomber-icon-blue.png',

    bio: 'Jade oversees all digital media and content creation.',
  },
  {
    id: 'Frank',
    name: 'Frank Lopez',
    role: 'Youth Coordinator',
    image: '/src/assets/bomber-icon-blue.png',

    bio: 'Jade oversees all digital media and content creation.',
  },
];

const DIRECTORS_TEAM = [
  {
    id: 'tony',
    name: 'Tony Knight',
    role: 'Southeast Regional Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Tony oversees the Southeast region of the program.',
  },
  {
    id: 'nate',
    name: 'Nate Rodriguez',
    role: 'Central and South Texas Area Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Nate oversees the central and south Texas area of the program.',
  },
  {
    id: 'chuck',
    name: 'Chuck Peters',
    role: 'North Houston Area Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Chuck oversees the north Houston area of the program.',
  },
  {
    id: 'mandi',
    name: 'Mandi Corbin',
    role: 'Southeast Houston Area Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Mandi oversees the southeast Houston area of the program.',
  },
  {
    id: 'kelly',
    name: 'Kelly Jacoby',
    role: 'Southwest Houston Area Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Kelly oversees the southwest Houston area of the program.',
  },
  {
    id: 'thad',
    name: 'Thad Bryant',
    role: 'West Texas Area Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Thad oversees the west Texas area of the program.',
  },
  {
    id: 'slade',
    name: 'Slade Maloney',
    role: 'North Texas/Oklahoma Area Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Slade oversees the north Texas / Oklahoma area of the program.',
  },
  {
    id: 'jeff',
    name: 'Jeff Dunning',
    role: 'Colorado State Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Jeff oversees the Colorado area of the program.',
  },
  {
    id: 'bill',
    name: 'Bill Roth',
    role: 'Missouri State Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Bill oversees the Missouri area of the program.',
  },
  {
    id: 'bobby',
    name: 'Bobby Lehman',
    role: 'Mississippi State Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Bobby oversees the Mississippi area of the program.',
  },
  {
    id: 'john',
    name: 'John Skyes',
    role: 'Tennessee State Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'John oversees the Tennessee area of the program.',
  },
  {
    id: 'steve',
    name: 'Steve Conyers',
    role: 'Virginia State Director',
    image: '/src/assets/bomber-icon-blue.png',
    bio: 'Steve oversees the Virginia area of the program.',
  },
];

const FACILITIES = [
  {
    id: '1',
    name: 'Bomber Facility',
    description:
      'State-of-the-art Pitching and Batting Training, batting cages, and weight rooms, all under one roof.',
    imageUrl:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/Facility_MainComplex.jpg',
    address: '5615 Bicentennial St San Antonio, TX 78219',
  },
];

const CULTURE_METRICS = [
  {
    id: 'metric1',
    number: '25+',
    label: 'Teams Nationally Ranked',
    icon: Award,
  },
  {
    id: 'metric2',
    number: '1000+',
    label: 'College Commitments',
    icon: TrendingUp,
  },
  { id: 'metric3', number: '235', label: 'Teams in 28 States', icon: MapPin },
  { id: 'metric4', number: '400+', label: 'Bomber Coaches', icon: Users },
  { id: 'metric5', number: '1900+', label: 'Bombers Nationwide', icon: Users },
  { id: 'metric6', number: '25', label: 'Years of Excellence', icon: Award },
];

export default function About() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [animatedMetrics, setAnimatedMetrics] = useState<
    Record<string, boolean>
  >({});
  const [activeTab, setActiveTab] = useState<'admin' | 'directors'>('admin');

  const { data: coaches = [] } = useQuery({
    queryKey: ['coaches'],
    queryFn: fetchCoaches,
  });

  // Animate metrics on mount
  useEffect(() => {
    CULTURE_METRICS.forEach((metric, index) => {
      setTimeout(() => {
        setAnimatedMetrics((prev) => ({ ...prev, [metric.id]: true }));
      }, index * 150);
    });
  }, []);

  // Filter coaches
  const filteredCoaches = coaches.filter((coach) => {
    const teamName =
      coach.headTeams.length > 0
        ? coach.headTeams[0].name
        : coach.teams.length > 0
          ? coach.teams[0].name
          : '';
    const coachName =
      `${coach.user?.fname || ''} ${coach.user?.lname || ''}`.toLowerCase();
    const state = coach.address?.state || '';

    const matchesSearch =
      teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coachName.includes(searchTerm.toLowerCase());
    const matchesState = !selectedState || state === selectedState;

    return matchesSearch && matchesState;
  });

  // Get unique states
  const states = [
    ...new Set(coaches.map((c) => c.address?.state).filter(Boolean)),
  ].sort();

  return (
    <div className="relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 min-h-screen">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#57a4ff]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <MainNav />
      <SocialSidebar />

      {/* Full-screen hero image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://bombersfastpitch.net/wp-content/uploads/2022/03/IMG_5804.jpg"
            alt="Bombers Fastpitch"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        </div>

        {/* Overlay with animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#57a4ff]/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 text-white uppercase tracking-tight">
            <span className="bg-gradient-to-r from-white via-[#57a4ff] to-white bg-clip-text text-transparent animate-pulse">
              WE ARE BOMBERS
            </span>
            <br />
            <span className="text-[#57a4ff]">FASTPITCH</span>
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent mx-auto mb-8"></div>
          <p className="text-2xl md:text-3xl text-neutral-200 max-w-5xl mx-auto leading-relaxed font-light">
            Building champions, one player at a time.
          </p>
        </div>

        {/* Scroll down indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
          onClick={() => {
            const descriptionSection = document.querySelector(
              '[data-section="description"]'
            );
            descriptionSection?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }}
        >
          <div className="flex flex-col items-center gap-2 animate-bounce hover:scale-110 transition-transform duration-300">
            <span className="text-sm text-neutral-400 uppercase tracking-widest font-bold hover:text-[#57a4ff] transition-colors">
              Scroll
            </span>
            <div className="w-6 h-10 border-2 border-[#57a4ff]/50 rounded-full flex justify-center hover:border-[#57a4ff] transition-colors">
              <div className="w-1 h-3 bg-[#57a4ff] rounded-full mt-2 animate-pulse"></div>
            </div>
            <ChevronDown className="w-6 h-6 text-[#57a4ff] animate-pulse hover:translate-y-1 transition-transform" />
          </div>
        </div>
      </section>

      <main className="relative z-20">
        {/* Program Description - Dark Section */}
        <section className="py-32 bg-neutral-950" data-section="description">
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-5xl md:text-6xl font-black text-white uppercase mb-12 tracking-tight">
                About Bombers Fastpitch
              </h2>
              <p className="text-2xl md:text-3xl text-neutral-200 max-w-5xl mx-auto leading-relaxed font-light">
                Bombers Fastpitch is a Junior Olympic girls softball program.
                Our primary goal is to develop young women into highly skilled
                athletes who can compete for and earn college scholarships. We
                believe in focusing on competition at the highest level as well
                as utilizing data and analytics to further the development of
                our players.
              </p>
            </div>
          </div>
        </section>

        {/* Culture Section with Quote - Immersive Experience */}
        <section className="mb-32">
          {/* Full-bleed background section */}
          <div className="relative bg-gradient-to-r from-neutral-900 via-[#57a4ff]/10 to-neutral-900 py-12 md:py-24 px-4 md:px-6 overflow-hidden">
            {/* Animated diagonal stripes in background */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute h-full w-2 bg-[#57a4ff] transform -skew-x-12"
                style={{ left: '10%' }}
              ></div>
              <div
                className="absolute h-full w-2 bg-[#57a4ff] transform -skew-x-12"
                style={{ left: '30%' }}
              ></div>
              <div
                className="absolute h-full w-2 bg-[#57a4ff] transform -skew-x-12"
                style={{ left: '50%' }}
              ></div>
              <div
                className="absolute h-full w-2 bg-[#57a4ff] transform -skew-x-12"
                style={{ left: '70%' }}
              ></div>
              <div
                className="absolute h-full w-2 bg-[#57a4ff] transform -skew-x-12"
                style={{ left: '90%' }}
              ></div>
            </div>

            <div className="relative max-w-8xl mx-auto">
              {/* Large centered quote */}
              <div className="text-center mb-12 md:mb-20">
                <h2 className="text-4xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-8 md:mb-16">
                  <span className="block">LEAVE</span>
                  <span className="block text-[#57a4ff]">A LEGEND</span>
                </h2>
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg md:text-2xl lg:text-3xl text-neutral-200 italic mb-6 md:mb-8 leading-relaxed">
                    "Leave everything on the field, leave the game better than
                    you found it. And when it comes time for you to leave, leave
                    a legend."
                  </p>
                  <p className="text-base md:text-xl text-[#57a4ff] font-bold">
                    — Kobe Bryant
                  </p>
                </div>
              </div>

              {/* Stats as flowing timeline/progression */}
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent transform -translate-y-1/2 hidden lg:block"></div>

                {/* Stats in a line */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 relative">
                  {CULTURE_METRICS.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <div
                        key={metric.id}
                        className={`relative text-center transform transition-all duration-700 ${
                          animatedMetrics[metric.id]
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-12'
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        {/* Icon circle */}
                        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4 mx-auto">
                          <div className="absolute inset-0 bg-[#57a4ff] rounded-full animate-ping opacity-20"></div>
                          <div className="relative bg-gradient-to-br from-[#57a4ff] to-blue-600 rounded-full w-full h-full flex items-center justify-center border-4 border-neutral-900 shadow-lg shadow-[#57a4ff]/50">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        {/* Number - huge and bold */}
                        <div className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2">
                          {metric.number}
                        </div>

                        {/* Label */}
                        <div className="text-[10px] md:text-xs lg:text-sm text-neutral-300 uppercase tracking-wide px-2 leading-tight">
                          {metric.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom tagline */}
              <div className="mt-12 md:mt-20 text-center">
                <p className="text-base md:text-xl lg:text-2xl text-neutral-300 font-light">
                  Building champions, one player at a time.{' '}
                  <span className="text-[#57a4ff] font-semibold">
                    The Bomber Way.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Staff with hover effects */}
        <section className="mb-32 px-4 md:px-6">
          <div className="mx-auto max-w-8xl">
            {/* Title with inline toggle */}
            <h2 className="mb-8 md:mb-12 text-3xl md:text-6xl font-black uppercase tracking-tight text-white">
              {/* Admin / Directors Switch */}
              <div className="inline-flex items-center gap-3 md:gap-6 flex-wrap">
                {/* Admin Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setActiveTab('admin')}
                  className={`relative px-2 transition-all duration-300 ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-[#57a4ff] via-[#3b82f6] to-[#57a4ff] bg-clip-text text-transparent'
                      : 'text-neutral-500'
                  }`}
                >
                  {activeTab === 'admin' && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#57a4ff] via-[#3b82f6] to-[#57a4ff]"
                    />
                  )}
                  Admin
                </motion.button>

                {/* Divider */}
                <span className="text-neutral-600 text-2xl md:text-4xl">/</span>

                {/* Directors Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setActiveTab('directors')}
                  className={`relative px-2 transition-all duration-300 ${
                    activeTab === 'directors'
                      ? 'bg-gradient-to-r from-[#57a4ff] via-[#3b82f6] to-[#57a4ff] bg-clip-text text-transparent'
                      : 'text-neutral-500'
                  }`}
                >
                  {activeTab === 'directors' && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#57a4ff] via-[#3b82f6] to-[#57a4ff]"
                    />
                  )}
                  Directors
                </motion.button>

                {/* Directory text */}
                <span className="text-3xl md:text-5xl text-white normal-case">
                  Staff
                </span>
              </div>
            </h2>

            {/* Content based on active tab */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {(activeTab === 'admin'
                ? ADMINISTRATION_TEAM
                : DIRECTORS_TEAM
              ).map((member, index) => (
                <div
                  key={member.id}
                  className="group relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-[#57a4ff] transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#57a4ff]/20"
                  onMouseEnter={() => setHoveredMember(member.id)}
                  onMouseLeave={() => setHoveredMember(null)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-4 md:p-8">
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 md:mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#57a4ff] to-blue-400 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#57a4ff]/50 group-hover:border-[#57a4ff] transition-all duration-500 transform group-hover:scale-110">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="inline-block text-[#57a4ff] text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 md:mb-4 px-3 md:px-4 py-1.5 md:py-2 bg-[#57a4ff]/10 border border-[#57a4ff]/30 rounded-full group-hover:bg-[#57a4ff]/20 transition-all duration-300">
                        {member.role}
                      </div>

                      <h3 className="text-xl md:text-2xl font-black text-white mb-3 md:mb-4 text-center group-hover:text-[#57a4ff] transition-colors duration-300">
                        {member.name}
                      </h3>

                      <div
                        className={`overflow-hidden transition-all duration-500 ${hoveredMember === member.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="text-neutral-300 text-xs md:text-sm text-center leading-relaxed px-2">
                          {member.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Facilities with parallax effect */}
        <section className="mb-32 px-4 md:px-6">
          <div className="mx-auto max-w-8xl">
            <h2 className="text-6xl font-black mb-16 text-white uppercase tracking-tight">
              <span className="bg-gradient-to-r from-white to-[#57a4ff] bg-clip-text text-transparent">
                FACILITIES
              </span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {FACILITIES.map((facility) => (
                <div
                  key={facility.id}
                  className="group relative bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-[#57a4ff] transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#57a4ff]/20"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={facility.imageUrl}
                      alt={facility.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h3 className="text-3xl font-black text-white mb-3 group-hover:text-[#57a4ff] transition-colors duration-300">
                        {facility.name}
                      </h3>
                      <div className="flex items-center gap-2 text-neutral-300">
                        <MapPin className="w-5 h-5 text-[#57a4ff]" />
                        <p className="text-sm">{facility.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-neutral-300 leading-relaxed text-lg">
                      {facility.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coaches Directory with enhanced search */}
        <section className="px-4 md:px-6 pb-20">
          <div className="mx-auto max-w-8xl">
            <h2 className="text-6xl font-black mb-12 text-white uppercase tracking-tight">
              <span className="bg-gradient-to-r from-white to-[#57a4ff] bg-clip-text text-transparent">
                COACHES DIRECTORY
              </span>
            </h2>

            {/* Search controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by team or coach name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-neutral-900/80 backdrop-blur-sm border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-2 focus:ring-[#57a4ff]/20 transition-all duration-300"
                />
              </div>
              <div className="relative md:w-64">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full appearance-none px-4 py-4 rounded-xl bg-neutral-900/80 backdrop-blur-sm border border-white/10 text-white focus:outline-none focus:border-[#57a4ff] focus:ring-2 focus:ring-[#57a4ff]/20 transition-all duration-300 cursor-pointer"
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state || undefined}>
                      {state}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
              </div>
            </div>

            {/* Results count */}
            <div className="mb-6 text-neutral-400 text-sm">
              Showing{' '}
              <span className="text-[#57a4ff] font-bold">
                {filteredCoaches.length}
              </span>{' '}
              coaches
            </div>

            {/* Table */}
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-800/50">
                    <tr className="border-b border-white/10">
                      <th className="text-left p-6 text-neutral-300 font-bold uppercase text-sm tracking-wider">
                        State
                      </th>
                      <th className="text-left p-6 text-neutral-300 font-bold uppercase text-sm tracking-wider">
                        Team Name
                      </th>
                      <th className="text-left p-6 text-neutral-300 font-bold uppercase text-sm tracking-wider">
                        Head Coach
                      </th>
                      <th className="text-left p-6 text-neutral-300 font-bold uppercase text-sm tracking-wider">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoaches.length > 0 ? (
                      filteredCoaches.map((coach, index) => (
                        <tr
                          key={coach.id || index}
                          className="border-b border-white/5 hover:bg-neutral-800/30 transition-all duration-200 group"
                        >
                          <td className="p-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#57a4ff]/10 border border-[#57a4ff]/30 rounded-full text-[#57a4ff] text-sm font-semibold">
                              <MapPin className="w-4 h-4" />
                              {coach.address?.state || 'N/A'}
                            </span>
                          </td>
                          <td className="p-6 text-white font-semibold group-hover:text-[#57a4ff] transition-colors">
                            {coach.headTeams.length > 0
                              ? coach.headTeams[0].name
                              : coach.teams.length > 0
                                ? coach.teams[0].name
                                : 'N/A'}
                          </td>
                          <td className="p-6 text-neutral-300">
                            {coach.user?.fname && coach.user?.lname
                              ? `${coach.user.fname} ${coach.user.lname}`
                              : 'N/A'}
                          </td>
                          <td className="p-6">
                            {coach.user?.email ? (
                              <a
                                href={`mailto:${coach.user.email}`}
                                className="inline-flex items-center gap-2 text-[#57a4ff] hover:text-blue-400 transition-colors group/email"
                              >
                                <Mail className="w-4 h-4 group-hover/email:scale-110 transition-transform" />
                                {coach.user.email}
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-12 text-center text-neutral-500"
                        >
                          <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="text-lg">
                            No coaches found matching your criteria
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
