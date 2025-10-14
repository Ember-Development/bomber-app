export default function NewsRail() {
  const articles = [
    {
      id: 1,
      title: 'Bombers Partner with New Balance',
      img: '/images/news1.jpg',
    },
    { id: 2, title: '2024 Nationals Announced', img: '/images/news2.jpg' },
    { id: 3, title: 'Training Facility Expansion', img: '/images/news3.jpg' },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-6 text-2xl font-bold uppercase">Latest News</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <article
              key={a.id}
              className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-video">
                <img
                  src={a.img}
                  alt={a.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <a
                  href="#"
                  className="mt-2 inline-block text-sm text-blue-700 hover:underline"
                >
                  Read More
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
