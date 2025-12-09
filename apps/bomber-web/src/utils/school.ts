export type FlatSchool = {
  name: string;
  state?: string;
  city?: string;
  imageUrl?: string;
  division: string;
  conference?: string;
  searchKey: string;
};

function makeSearchKey(s: Partial<FlatSchool>): string {
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

type SchoolData = {
  divisions?: (Div1Block | OtherBlock)[];
};

export function flattenSchools(data: unknown): FlatSchool[] {
  if (!data || typeof data !== 'object') return [];

  // Handle both { divisions: [...] } and direct array formats
  const divisions = Array.isArray(data)
    ? data
    : 'divisions' in data && Array.isArray((data as SchoolData).divisions)
      ? (data as SchoolData).divisions!
      : [];

  const flat: FlatSchool[] = [];

  for (const div of divisions) {
    if (!div || typeof div !== 'object' || !('division' in div)) continue;

    const division = String(div.division || '');

    // Div1 format: has conferences
    if ('conferences' in div && Array.isArray(div.conferences)) {
      for (const conf of div.conferences) {
        if (!conf || typeof conf !== 'object') continue;
        const conference = String(conf.conference || '');
        const schools = Array.isArray(conf.schools) ? conf.schools : [];

        for (const school of schools) {
          if (!school || typeof school !== 'object') continue;
          flat.push({
            name: String(school.name || ''),
            state: school.state ? String(school.state) : undefined,
            city: school.city ? String(school.city) : undefined,
            imageUrl: school.imageUrl ? String(school.imageUrl) : undefined,
            division,
            conference: conference || undefined,
            searchKey: makeSearchKey({
              name: school.name,
              city: school.city,
              state: school.state,
              conference,
              division,
            }),
          });
        }
      }
    }
    // Other divisions format: schools directly in division
    else if ('schools' in div && Array.isArray(div.schools)) {
      for (const school of div.schools) {
        if (!school || typeof school !== 'object') continue;
        flat.push({
          name: String(school.name || ''),
          state: school.state ? String(school.state) : undefined,
          city: school.city ? String(school.city) : undefined,
          imageUrl: school.imageUrl ? String(school.imageUrl) : undefined,
          division,
          searchKey: makeSearchKey({
            name: school.name,
            city: school.city,
            state: school.state,
            division,
          }),
        });
      }
    }
  }

  return flat;
}
