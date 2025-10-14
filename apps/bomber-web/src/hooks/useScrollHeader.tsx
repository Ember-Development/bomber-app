import { useEffect, useState } from 'react';

/** Becomes true when scrolling past `offset` px (used to morph the side nav to top bar). */
export function useScrollHeader(offset = 200) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return solid;
}
