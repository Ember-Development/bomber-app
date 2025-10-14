import type { ReactNode } from 'react';
export default function SectionShell({ children }: { children: ReactNode }) {
  return (
    <section className="py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
