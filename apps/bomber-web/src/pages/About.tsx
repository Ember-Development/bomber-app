import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
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
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FScottSmith-scaled_hwsvuk.webp?alt=media&token=83ec2ebd-02dd-4371-8e1c-c2d4dd93b51a',
    bio: 'With over two decades of experience in elite fastpitch softball, Scott has built Bombers into a nationally recognized powerhouse. As CEO and President, he oversees strategic vision while coaching our premier 18U Gold team. His leadership has produced 1000+ college commitments and multiple national championships, embodying the Bomber commitment to excellence both on and off the field.',
  },
  {
    id: 'bo',
    name: 'Bo Vinton',
    role: 'Chief Operating Officer/Executive Vice President',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FPolish_20251106_115054656_pwpgpc.jpg?alt=media&token=005cfec9-17f1-42e3-85bb-bc6087706cb2',
    bio: 'Bo drives operational excellence across all Bombers programs nationwide. As COO and Executive Vice President, he architects our comprehensive player development curriculum and mentors our 400+ coaching staff. His systematic approach to skill development and data-driven training methodologies have become the gold standard in youth fastpitch, ensuring every Bomber receives world-class instruction.',
  },
  {
    id: 'david',
    name: 'David McCorkle',
    role: 'Assistant Program Director/Vice President',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FAPP_Headshot_David_McCorkle_m7flas.jpg?alt=media&token=08a4cbf2-7cf1-4195-8e01-f00e53f3470f',
    bio: 'David brings strategic leadership to program development. As Assistant Program Director and Vice President, he specializes in defensive systems and team tactics. His innovative approach to defensive training and game strategy has helped countless players earn Division I scholarships and develop into complete athletes.',
  },
  {
    id: 'kevin',
    name: 'Kevin Mills',
    role: 'Chief Financial Officer',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FtempFileForShare_20260119-120759.jpg?alt=media&token=1750c03a-5e30-496c-97d1-c115e8256e15',
    bio: 'Kevin ensures financial stability and sustainable growth across the Bombers organization. As CFO, he manages budgets, oversees facility investments, and creates financial strategies that allow us to expand our reach while maintaining exceptional program quality. His fiscal stewardship enables us to invest in cutting-edge training equipment and top-tier coaching talent.',
  },
  {
    id: 'noe',
    name: 'Noe Saucedo',
    role: 'Chief Legal Officer',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Funnamed.jpg?alt=media&token=518f38b7-6b79-4469-891f-1e3595624d8c',
    bio: 'Noe protects the organization and our families through comprehensive legal oversight. As Chief Legal Officer, he handles contracts, compliance, risk management, and ensures all operations meet regulatory standards. His expertise in sports law and youth athletics provides peace of mind to our families and creates a secure environment for our athletes to thrive.',
  },
  {
    id: 'jennifer',
    name: 'Jennifer Vinton',
    role: 'Director of Operations',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FPolish_20251106_114507579_worwcm.jpg?alt=media&token=e81a5bf1-8651-4336-a3df-ad5cc3436606',
    bio: "Jennifer orchestrates the day-to-day operations that keep Bombers running seamlessly. As Director of Operations, she coordinates tournament schedules, manages facilities, oversees logistics for 235 teams across 28 states, and ensures every detail supports our athletes' success. Her organizational excellence and attention to detail create the foundation for championship-level performance.",
  },
  {
    id: 'allison',
    name: 'Allison Honkofsky',
    role: 'Director of Recruiting',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FAPP_Headshot_Allison_Honkofsky_x441v6.jpg?alt=media&token=a214bd16-0c5a-42d0-b4a4-c67c9c516319',
    bio: "Allison is the driving force behind our players' college dreams. As Director of Recruiting, she cultivates relationships with college coaches nationwide, coordinates showcase events, and guides families through the recruiting process. Her extensive network and deep knowledge of college softball have helped hundreds of Bombers earn scholarships at every collegiate level.",
  },
  {
    id: 'brian',
    name: 'Brian Repole',
    role: 'Assistant Director of Recruiting',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'Brian supports our recruiting mission by connecting athletes with college opportunities. As Assistant Director of Recruiting, he manages player profiles, coordinates college coach communications, and helps families navigate the complex recruiting landscape. His dedication to matching players with the right programs has made college dreams a reality for countless Bombers.',
  },
  {
    id: 'christy',
    name: 'Christy Connor',
    role: 'Director of Brand Development',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fchristy.jpg?alt=media&token=918dec4b-c125-4124-839d-62de0298c9b2',
    bio: "Christy shapes the Bombers brand and tells our athletes' stories to the world. As Director of Brand Development, she leads marketing strategy, creates compelling content, and builds partnerships that elevate our program's visibility. Her creative vision and strategic marketing initiatives have established Bombers as one of the most recognized brands in fastpitch softball.",
  },
  {
    id: 'jade',
    name: 'Jade Nottebrok',
    role: 'Media Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FdSF3v8w5fwW4BsPX5ARHi6GOr8ryHmRMekyDSFcT_eduho5.webp?alt=media&token=801cd2f7-c2dd-41fb-b041-193499dccb54',
    bio: "Jade captures and shares the Bomber experience through powerful visual storytelling. As Media Director, she oversees all digital content creation, manages social media platforms, and produces highlight videos that showcase our athletes' achievements. Her creative eye and technical expertise bring the excitement of Bombers softball to families and fans worldwide.",
  },
  {
    id: 'kristi',
    name: 'Kristi Malpass',
    role: 'Training Coordinator',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fmalpass.png?alt=media&token=ae99061d-b8b3-4827-ab0d-f936b7145229',
    bio: 'Kristi designs and implements our comprehensive training programs. As Training Coordinator, she schedules camps, coordinates clinics, manages facility usage, and ensures our athletes have access to elite-level instruction year-round. Her meticulous planning and passion for player development create optimal training environments where Bombers can reach their full potential.',
  },
  {
    id: 'cat',
    name: 'Cat Osterman',
    role: 'Pitching Performance Coordinator',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2F33_yhqcco.png?alt=media&token=38cbfa1f-cab5-4ff4-87aa-d157db088b88',
    bio: 'A USA Softball Olympic legend and one of the greatest pitchers in softball history, Cat brings world-class expertise to our pitching program. As Pitching Performance Coordinator, she develops cutting-edge pitching curriculum, mentors our pitching coaches, and works directly with elite pitchers. Her unparalleled knowledge elevates every pitcher in the Bombers organization.',
  },
  {
    id: 'frank',
    name: 'Frank Lopez',
    role: 'Youth Coordinator',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FAPP%20Headshot%20Frank%20Lopez.jpg?alt=media&token=8330b111-701a-4454-89c8-30d3753f3323',
    bio: 'Frank builds the foundation for future Bombers through our youth programs. As Youth Coordinator, he oversees development for our youngest athletes, coordinates youth camps and clinics, and ensures age-appropriate training that instills fundamentals and love for the game. His focus on youth development creates a pipeline of skilled, passionate players ready for elite competition.',
  },
];

const DIRECTORS_TEAM = [
  {
    id: 'tony',
    name: 'Tony Knight',
    role: 'Southeast Regional Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FTK%20Headshot.jpg?alt=media&token=8a0ec473-9226-418c-a134-6ba084ceaf6e',
    bio: 'Tony oversees the Southeast region of the program.',
  },
  {
    id: 'nate',
    name: 'Nate Rodriguez',
    role: 'Central and South Texas Area Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'Nate oversees the central and south Texas area of the program.',
  },
  {
    id: 'chuck',
    name: 'Chuck Peters',
    role: 'North Houston Area Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'Chuck oversees the north Houston area of the program.',
  },
  {
    id: 'mandi',
    name: 'Mandi Corbin',
    role: 'Southeast Houston Area Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2F20251008-L86A3932-Edit_Original.jpeg?alt=media&token=bee2834b-c323-415e-98e9-b2fa3a762e39',
    bio: 'Mandi oversees the southeast Houston area of the program.',
  },
  {
    id: 'kelly',
    name: 'Kelli Jacoby',
    role: 'Southwest Houston Area Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FAPP_Headshot_Kelli_Jacoby_vhqot3.png?alt=media&token=27d993c1-a387-42dd-a0cd-50fd6d424251',
    bio: 'Kelly oversees the southwest Houston area of the program.',
  },
  {
    id: 'thad',
    name: 'Thad Bryant',
    role: 'West Texas Area Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'Thad oversees the west Texas area of the program.',
  },
  {
    id: 'slade',
    name: 'Slade Maloney',
    role: 'North Texas/Oklahoma Area Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'Slade oversees the north Texas / Oklahoma area of the program.',
  },
  {
    id: 'jeff',
    name: 'Jeff Dunning',
    role: 'Colorado State Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FAPP%20Headshot%20Jeff%20Dunning.jpg?alt=media&token=b34bfe3a-275b-4536-972b-eff3b568ca86',
    bio: 'Jeff oversees the Colorado area of the program.',
  },
  {
    id: 'bill',
    name: 'Bill Roth',
    role: 'Missouri State Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'Bill oversees the Missouri area of the program.',
  },
  {
    id: 'bobby',
    name: 'Bobby Lehman',
    role: 'Mississippi State Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'Bobby oversees the Mississippi area of the program.',
  },
  {
    id: 'john',
    name: 'John Skyes',
    role: 'Tennessee State Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'John oversees the Tennessee area of the program.',
  },
  {
    id: 'steve',
    name: 'Steve Conyers',
    role: 'Virginia State Director',
    image:
      'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fcropped-Bombers-Fastpitch-New-Blue-1-1_brkgva.png?alt=media&token=fabfa030-33fe-4178-a24b-fbe70f213675',
    bio: 'Steve oversees the Virginia area of the program.',
  },
];

const FACILITIES = [
  {
    id: '1',
    name: 'Bomber Facility',
    description:
      'State-of-the-art Pitching and Batting Training, batting cages, and weight rooms, all under one roof.',
    imageUrl: 'https://www.youcanwake.com/wp-content/uploads/2016/04/tsr_1.jpg',
    address: '6700 I-35, New Braunfels, TX 78130',
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
    number: '1500+',
    label: 'College Commitments',
    icon: TrendingUp,
  },
  { id: 'metric3', number: '235', label: 'Teams in 28 States', icon: MapPin },
  { id: 'metric4', number: '600+', label: 'Bomber Coaches', icon: Users },
  { id: 'metric5', number: '2500+', label: 'Bombers Nationwide', icon: Users },
  { id: 'metric6', number: '25', label: 'Years of Excellence', icon: Award },
];

const COACHES_PER_PAGE = 15;

export default function About() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showAcademyOnly, setShowAcademyOnly] = useState(false);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [animatedMetrics, setAnimatedMetrics] = useState<
    Record<string, boolean>
  >({});
  const [activeTab, setActiveTab] = useState<'admin' | 'directors'>('admin');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Check for academy filter in URL params on mount
  useEffect(() => {
    const academyParam = searchParams.get('academy');
    if (academyParam === 'true') {
      setShowAcademyOnly(true);
    }
  }, [searchParams]);

  // Scroll to coaches section if hash is present
  useEffect(() => {
    if (window.location.hash === '#coaches') {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const coachesSection = document.getElementById('coaches');
        if (coachesSection) {
          coachesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }, []);

  // Check if coach has any academy teams
  const hasAcademyTeam = (coach: (typeof coaches)[0]) => {
    const allTeams = [...coach.headTeams, ...coach.teams];
    return allTeams.some((team) => team.region === 'ACADEMY');
  };

  // Count academy coaches
  const academyCoachCount = coaches.filter(hasAcademyTeam).length;

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
    const matchesAcademy = !showAcademyOnly || hasAcademyTeam(coach);

    return matchesSearch && matchesState && matchesAcademy;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCoaches.length / COACHES_PER_PAGE);
  const startIndex = (currentPage - 1) * COACHES_PER_PAGE;
  const endIndex = startIndex + COACHES_PER_PAGE;
  const paginatedCoaches = filteredCoaches.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedState, showAcademyOnly]);

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
            src="https://res.cloudinary.com/duwgrvngn/image/upload/v1764621606/EFaywyfXYAAdXKd_sy0lhk.jpg"
            alt="Bombers Fastpitch"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/90 to-black/90" />
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
              {FACILITIES.map((facility) => {
                // Create Google Maps URL
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}`;

                return (
                  <a
                    key={facility.id}
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:contents group"
                  >
                    <div className="group relative bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-[#57a4ff] transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#57a4ff]/20 md:block cursor-pointer md:cursor-default">
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
                        {/* Mobile-only indicator */}
                        <div className="mt-4 md:hidden flex items-center gap-2 text-[#57a4ff] text-sm font-semibold">
                          <MapPin className="w-4 h-4" />
                          <span>Tap to open in Maps</span>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Coaches Directory with enhanced search */}
        <section id="coaches" className="px-4 md:px-6 pb-20">
          <div className="mx-auto max-w-8xl">
            <h2 className="text-6xl font-black mb-12 text-white uppercase tracking-tight">
              <span className="bg-gradient-to-r from-white to-[#57a4ff] bg-clip-text text-transparent">
                COACHES DIRECTORY
              </span>
            </h2>

            {/* Search controls */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
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

              {/* Academy Filter Button */}
              {academyCoachCount > 0 && (
                <div>
                  <button
                    onClick={() => setShowAcademyOnly(!showAcademyOnly)}
                    className={`group relative px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-500 overflow-hidden ${
                      showAcademyOnly
                        ? 'bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white shadow-[0_0_30px_rgba(87,164,255,0.6)]'
                        : 'bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 text-[#57a4ff] hover:from-neutral-800/70 hover:to-neutral-900/70 border border-[#57a4ff]/30'
                    }`}
                  >
                    {/* Animated background glow */}
                    {showAcademyOnly && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}

                    {/* Icon and text */}
                    <span className="relative flex items-center justify-center gap-2">
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${showAcademyOnly ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                      <span>
                        {showAcademyOnly
                          ? 'ACADEMY ONLY'
                          : 'SHOW ONLY ACADEMY COACHES'}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          showAcademyOnly ? 'bg-white/20' : 'bg-[#57a4ff]/20'
                        }`}
                      >
                        {academyCoachCount}
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-neutral-400 text-sm">
                Showing{' '}
                <span className="text-[#57a4ff] font-bold">
                  {filteredCoaches.length}
                </span>{' '}
                {filteredCoaches.length === 1 ? 'coach' : 'coaches'}
                {totalPages > 1 && (
                  <span className="ml-2">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </div>
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
                      paginatedCoaches.map((coach, index) => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-400">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredCoaches.length)} of{' '}
                  {filteredCoaches.length} coaches
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#57a4ff]/50 transition-all duration-300 font-bold text-sm uppercase tracking-wider"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore =
                          index > 0 && array[index - 1] !== page - 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsisBefore && (
                              <span className="text-neutral-500 px-2">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[40px] px-3 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                                currentPage === page
                                  ? 'bg-[#57a4ff] text-white'
                                  : 'bg-neutral-900/50 border border-white/10 text-white hover:border-[#57a4ff]/50'
                              }`}
                              aria-label={`Go to page ${page}`}
                              aria-current={
                                currentPage === page ? 'page' : undefined
                              }
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#57a4ff]/50 transition-all duration-300 font-bold text-sm uppercase tracking-wider"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
