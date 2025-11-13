import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = 'Bomber Fastpitch | Elite Fastpitch Softball Training & Teams',
  description = 'Premier fastpitch softball organization offering elite training, competitive teams, and college recruiting.',
  image = 'https://res.cloudinary.com/duwgrvngn/image/upload/v1763068366/bomber-black-removebg-preview_tkvf3d.png',
  url = 'https://bomberfastpitch.net',
  type = 'website',
}: SEOProps) {
  const fullTitle = title.includes('Bomber Fastpitch')
    ? title
    : `${title} | Bomber Fastpitch`;
  const fullImageUrl = image.startsWith('http')
    ? image
    : `https://bomberfastpitch.net${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      <link rel="canonical" href={url} />
    </Helmet>
  );
}
