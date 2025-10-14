function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-extrabold tracking-widest">{title}</h4>
      <ul className="mt-3 space-y-2 opacity-80">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="hover:opacity-100 opacity-80">
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-neutral-400 py-10 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-full bg-black text-white grid place-items-center">
              B
            </div>
            <p className="text-xs opacity-70">
              TRAINING FACILITY: 5615 Bicentennial St San Antonio, TX 78219
            </p>
          </div>
          <FooterCol title="Bombers" items={['About Us', 'Teams', 'News']} />
          <FooterCol title="Resources" items={['Shop', 'Events', 'Media']} />
          <FooterCol
            title="Contact Us"
            items={['Email', 'Instagram', 'Facebook']}
          />
        </div>
        <div className="mt-8 flex items-center justify-between opacity-70">
          <span>BOMBERS FASTPITCH</span>
          <span>BUILT BY EMBER</span>
        </div>
      </div>
    </footer>
  );
}
