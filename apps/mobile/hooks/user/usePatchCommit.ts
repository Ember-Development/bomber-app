import { FlatSchool } from '@/utils/SchoolUtil';

export type CommitCreatePayload = {
  name: string;
  state: string;
  city: string;
  committedDate: string; // ISO
  imageUrl?: string;
};

export type CommitPatchPayload = Partial<
  Omit<CommitCreatePayload, 'committedDate'>
> & {
  committedDate?: string;
};

export function buildCommitCreatePayload(opts: {
  collegeSchool?: FlatSchool;
  collegeDisplay?: string;
  fallbackState?: string;
  fallbackCity?: string;
  commitDate?: string; // YYYY-MM-DD
}): CommitCreatePayload {
  const name = (opts.collegeDisplay || opts.collegeSchool?.name || '').trim();
  const state = (opts.collegeSchool?.state || opts.fallbackState || '').trim();
  const city = (opts.collegeSchool?.city || opts.fallbackCity || '').trim();

  if (!name) throw new Error('Enter a college name or pick a school.');
  if (!state || !city)
    throw new Error('College commit is missing: state or city');

  const payload: CommitCreatePayload = {
    name,
    state,
    city,
    committedDate: (opts.commitDate
      ? new Date(opts.commitDate)
      : new Date()
    ).toISOString(),
  };
  if (opts.collegeSchool?.imageUrl)
    payload.imageUrl = opts.collegeSchool.imageUrl;
  return payload;
}

export function buildCommitPatchPayload(opts: {
  collegeSchool?: FlatSchool;
  collegeDisplay?: string; // use this if user free-typed a new name
  commitDate?: string;
}): CommitPatchPayload {
  const patch: CommitPatchPayload = {};
  // If a new school was chosen:
  if (opts.collegeSchool?.name) patch.name = opts.collegeSchool.name;
  if (opts.collegeSchool?.state) patch.state = opts.collegeSchool.state;
  if (opts.collegeSchool?.city) patch.city = opts.collegeSchool.city;
  if (opts.collegeSchool?.imageUrl)
    patch.imageUrl = opts.collegeSchool.imageUrl;

  // If they free-typed a new display name and didn't pick from list:
  if (!opts.collegeSchool?.name && opts.collegeDisplay?.trim()) {
    patch.name = opts.collegeDisplay.trim();
  }

  if (opts.commitDate) {
    patch.committedDate = new Date(opts.commitDate).toISOString();
  }

  return patch;
}

export function hasKeys(o: object) {
  return Object.keys(o).length > 0;
}
