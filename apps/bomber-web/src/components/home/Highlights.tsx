import FadeIn from '../animation/FadeIn';

export default function Highlights() {
  const blocks = [
    {
      title: 'National Champions',
      text: 'Dominating the field with unmatched teamwork and dedication.',
      img: '/images/highlight-1.jpg',
    },
    {
      title: 'Elite Development',
      text: 'Raising the next generation of top-tier athletes.',
      img: '/images/highlight-2.jpg',
    },
    {
      title: 'Commitment to Excellence',
      text: 'Proud partners of industry leaders shaping softball’s future.',
      img: '/images/highlight-3.jpg',
    },
  ];

  return (
    <section className="grid gap-12 py-16 md:gap-20 md:py-24">
      {blocks.map((b, i) => (
        <FadeIn key={b.title} delay={i * 0.1}>
          <div
            key={b.title}
            className={`grid items-center gap-8 md:grid-cols-2 ${
              i % 2 !== 0 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className="relative h-96 overflow-hidden rounded-3xl shadow-lg">
              <img
                src={b.img}
                alt={b.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="max-w-lg space-y-4 px-4">
              <h2 className="text-3xl font-bold tracking-tight">{b.title}</h2>
              <p className="text-lg text-neutral-700">{b.text}</p>
            </div>
          </div>
        </FadeIn>
      ))}
    </section>
  );
}
