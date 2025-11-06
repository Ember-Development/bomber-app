import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import Hero from '@/components/home/Hero';
import NewsRail from '@/components/home/NewsRail';
import SiteFooter from '@/components/layout/SiteFooter';
import UpcomingEvent from '@/components/home/UpcomingEvent';
import ChampionshipHistory from '@/components/home/ChampionshipHistory';
import SponsorsStrip from '@/components/home/SponsorsStrip';
import MediaRail from '@/components/home/MediaRail';
import AppPromoAndSocial from '@/components/home/AppPromoAndSocial';

export default function Home() {
  return (
    <div className="relative bg-neutral-950 overflow-x-hidden">
      <MainNav />
      <SocialSidebar />
      <Hero />
      {/* Keep content above Hero but below MainNav */}
      <main className="relative z-[40] overflow-x-hidden">
        <NewsRail />
        <UpcomingEvent />
        <ChampionshipHistory />
        <SponsorsStrip />
        <MediaRail />
        <AppPromoAndSocial />
        {/* Add the background color AFTER NewsRail */}
        <div className="">
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
