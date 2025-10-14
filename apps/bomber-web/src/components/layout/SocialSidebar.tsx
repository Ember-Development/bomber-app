import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
} from '@/components/ui/icons';

export default function SocialSidebar() {
  const socials = [
    {
      key: 'facebook',
      icon: FacebookIcon,
      href: 'https://facebook.com/texasbombers',
      label: 'Follow us on Facebook',
    },
    {
      key: 'instagram',
      icon: InstagramIcon,
      href: 'https://instagram.com/texasbombers',
      label: 'Follow us on Instagram',
    },
    {
      key: 'youtube',
      icon: YouTubeIcon,
      href: 'https://youtube.com/@texasbombers',
      label: 'Subscribe on YouTube',
    },
    {
      key: 'tiktok',
      icon: TikTokIcon,
      href: 'https://tiktok.com/@texasbombers',
      label: 'Follow us on TikTok',
    },
  ];

  return (
    <aside className="pointer-events-none fixed right-4 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex">
      {socials.map((s) => {
        const Icon = s.icon;
        return (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur ring-1 ring-white/10 transition-all hover:bg-black/80 hover:scale-110"
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </aside>
  );
}
