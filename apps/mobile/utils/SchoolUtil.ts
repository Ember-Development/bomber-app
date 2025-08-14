// utils/SchoolUtil.ts
export type FlatSchool = {
  name: string;
  state?: string;
  city?: string;
  imageUrl?: string;
  division: string;
  conference?: string;
  searchKey: string;
};

function makeSearchKey(s: Partial<FlatSchool>) {
  return [s.name, s.city, s.state, s.conference, s.division]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

type Div1Block = {
  division: string;
  conferences?: { conference?: string; schools?: any[] }[];
};

type OtherBlock = {
  division: string;
  schools?: any[];
};

export function flattenSchools(data: unknown): FlatSchool[] {
  const arr: (Div1Block | OtherBlock)[] = Array.isArray(
    (data as any)?.divisions
  )
    ? (data as any).divisions
    : Array.isArray(data)
      ? (data as any)
      : [];

  const out: FlatSchool[] = [];

  for (const block of arr) {
    if (!block || !block.division) continue;

    if (block.division === 'NCAA Division I') {
      for (const conf of block.conferences ?? []) {
        for (const s of conf?.schools ?? []) {
          const base = {
            name: s?.name ?? '',
            state: s?.state,
            city: s?.city,
            imageUrl: s?.imageUrl,
            division: block.division,
            conference: conf?.conference,
          };
          if (!base.name) continue;
          out.push({ ...base, searchKey: makeSearchKey(base) });
        }
      }
    } else {
      for (const s of (block as OtherBlock).schools ?? []) {
        const base = {
          name: s?.name ?? '',
          state: s?.state,
          city: s?.city,
          imageUrl: s?.imageUrl,
          division: block.division,
        };
        if (!base.name) continue;
        out.push({ ...base, searchKey: makeSearchKey(base) });
      }
    }
  }

  return out;
}
