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
  // Handle both { divisions: [...] } and direct array formats
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

    if ((block as any).conferences) {
      // Handle divisions with conferences (Division I, Junior College, etc.)
      const confBlock = block as Div1Block;
      for (const conf of confBlock.conferences ?? []) {
        // Conference could be an object with 'schools' or an array of schools
        if (conf?.schools) {
          // Standard conference structure
          for (const s of conf.schools) {
            const base = {
              name: s?.name ?? '',
              state: s?.state,
              city: s?.city,
              imageUrl: s?.imageUrl,
              division: block.division,
              conference: (conf as any)?.conference,
            };
            if (!base.name) continue;
            out.push({ ...base, searchKey: makeSearchKey(base) });
          }
        } else {
          // Some conferences have schools directly (like Junior College)
          const base = {
            name: (conf as any)?.name ?? '',
            state: (conf as any)?.state,
            city: (conf as any)?.city,
            imageUrl: (conf as any)?.imageUrl,
            division: block.division,
            conference: (conf as any)?.conference,
          };
          if (!base.name) continue;
          out.push({ ...base, searchKey: makeSearchKey(base) });
        }
      }
    } else {
      // For divisions without conferences (Division II, III, etc.)
      const schools = (block as any).schools ?? [];
      for (const s of schools) {
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

  // Debug logging
  console.log(
    '[flattenSchools] Processed divisions:',
    arr.map((b) => ({
      division: b.division,
      hasConferences: !!(b as any).conferences,
      schoolCount:
        ((b as any).schools?.length ?? 0) +
        ((b as any).conferences?.[0]?.schools?.length ?? 0),
    }))
  );
  console.log('[flattenSchools] Total schools flattened:', out.length);

  // Check if Ancilla is in the output
  const ancilla = out.find((s) => s.name.toLowerCase().includes('ancilla'));
  if (ancilla) {
    console.log('[flattenSchools] ✅ Ancilla found:', ancilla);
  } else {
    console.log('[flattenSchools] ❌ Ancilla NOT in output');
  }

  return out;
}
