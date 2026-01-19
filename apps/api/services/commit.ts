import { CommitDB } from '@bomber-app/database';
import { prisma } from '../api';
import fs from 'fs/promises';
import path from 'path';

type CommitCreateInput = Omit<CommitDB, 'id' | 'players'>;
type CommitUpdateInput = Partial<CommitCreateInput>;

interface School {
  name: string;
  state: string;
  city: string;
  imageUrl: string;
}

export const commitService = {
  getAll: async () => {
    return prisma.commit.findMany({
      orderBy: { committedDate: 'asc' },
      include: {
        players: {
          include: {
            user: true,
            address: true,
          },
        },
      },
    });
  },

  getById: async (id: string) => {
    return prisma.commit.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            user: true,
            address: true,
          },
        },
      },
    });
  },

  createCommit: async (data: {
    name: string;
    state: string;
    city: string;
    imageUrl?: string;
    committedDate: Date;
  }) => {
    return prisma.commit.create({
      data: {
        name: data.name,
        state: data.state,
        city: data.city,
        imageUrl: data.imageUrl || '',
        committedDate: data.committedDate,
      },
    });
  },

  update: async (id: string, data: CommitUpdateInput) => {
    return prisma.commit.update({
      where: { id },
      data: {
        ...data,
        ...(data.committedDate && {
          committedDate:
            data.committedDate instanceof Date
              ? data.committedDate
              : new Date(data.committedDate),
        }),
      },
    });
  },

  remove: async (id: string) => {
    return prisma.commit.delete({ where: { id } });
  },

  /**
   * Syncs commit imageUrls with schools.json
   * Matches commits to schools by name, state, and city
   * Updates imageUrl for matching commits
   */
  syncWithSchoolsJson: async () => {
    try {
      // Load schools.json
      const filePath = path.join(__dirname, '../data/schools.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const schoolsData = JSON.parse(data);

      // Flatten the nested structure (division -> conferences -> schools)
      const schools: School[] = [];
      schoolsData.forEach((division: any) => {
        division.conferences?.forEach((conference: any) => {
          conference.schools?.forEach((school: School) => {
            schools.push(school);
          });
        });
      });

      // Create a lookup map for faster matching
      // Key: normalized name + state + city
      const schoolMap = new Map<string, School>();
      schools.forEach((school) => {
        const key = `${normalizeString(school.name)}|${normalizeString(school.state)}|${normalizeString(school.city)}`;
        schoolMap.set(key, school);
      });

      // Get all commits
      const commits = await prisma.commit.findMany();

      let updatedCount = 0;
      const updates: Array<{ id: string; imageUrl: string }> = [];

      // Match commits to schools and collect updates
      for (const commit of commits) {
        // Try exact match first
        const exactKey = `${normalizeString(commit.name)}|${normalizeString(commit.state)}|${normalizeString(commit.city)}`;
        let matchedSchool = schoolMap.get(exactKey);

        // If no exact match, try fuzzy matching
        if (!matchedSchool) {
          matchedSchool = findFuzzyMatch(commit, schools) || undefined;
        }

        // Update if we found a match and imageUrl is different
        if (matchedSchool && matchedSchool.imageUrl !== commit.imageUrl) {
          updates.push({
            id: commit.id,
            imageUrl: matchedSchool.imageUrl,
          });
        }
      }

      // Batch update all commits
      if (updates.length > 0) {
        await Promise.all(
          updates.map((update) =>
            prisma.commit.update({
              where: { id: update.id },
              data: { imageUrl: update.imageUrl },
            })
          )
        );
        updatedCount = updates.length;
      }

      return {
        success: true,
        totalCommits: commits.length,
        updatedCount,
        message: `Successfully synced ${updatedCount} commit(s) with schools.json`,
      };
    } catch (error: any) {
      console.error('Error syncing commits with schools.json:', error);
      throw new Error(`Failed to sync commits: ${error.message}`);
    }
  },
};

/**
 * Normalize string for comparison (lowercase, trim, remove extra spaces)
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,]/g, '');
}

/**
 * Find a fuzzy match for a commit in the schools array
 * Matches by name similarity and state/city
 */
function findFuzzyMatch(
  commit: { name: string; state: string; city: string },
  schools: School[]
): School | undefined {
  const normalizedCommitName = normalizeString(commit.name);
  const normalizedCommitState = normalizeString(commit.state);
  const normalizedCommitCity = normalizeString(commit.city);

  // State abbreviation to full name mapping
  const stateAbbrevMap: Record<string, string> = {
    al: 'alabama',
    ak: 'alaska',
    az: 'arizona',
    ar: 'arkansas',
    ca: 'california',
    co: 'colorado',
    ct: 'connecticut',
    de: 'delaware',
    fl: 'florida',
    ga: 'georgia',
    hi: 'hawaii',
    id: 'idaho',
    il: 'illinois',
    in: 'indiana',
    ia: 'iowa',
    ks: 'kansas',
    ky: 'kentucky',
    la: 'louisiana',
    me: 'maine',
    md: 'maryland',
    ma: 'massachusetts',
    mi: 'michigan',
    mn: 'minnesota',
    ms: 'mississippi',
    mo: 'missouri',
    mt: 'montana',
    ne: 'nebraska',
    nv: 'nevada',
    nh: 'new hampshire',
    nj: 'new jersey',
    nm: 'new mexico',
    ny: 'new york',
    nc: 'north carolina',
    nd: 'north dakota',
    oh: 'ohio',
    ok: 'oklahoma',
    or: 'oregon',
    pa: 'pennsylvania',
    ri: 'rhode island',
    sc: 'south carolina',
    sd: 'south dakota',
    tn: 'tennessee',
    tx: 'texas',
    ut: 'utah',
    vt: 'vermont',
    va: 'virginia',
    wa: 'washington',
    wv: 'west virginia',
    wi: 'wisconsin',
    wy: 'wyoming',
  };

  // Normalize state (handle abbreviations)
  let normalizedState = normalizedCommitState;
  if (normalizedCommitState.length === 2) {
    normalizedState =
      stateAbbrevMap[normalizedCommitState] || normalizedCommitState;
  }

  // Find best match
  let bestMatch: School | undefined = undefined;
  let bestScore = 0;

  for (const school of schools) {
    const normalizedSchoolName = normalizeString(school.name);
    const normalizedSchoolState = normalizeString(school.state);
    const normalizedSchoolCity = normalizeString(school.city);

    // State must match (with abbreviation handling)
    const stateMatches =
      normalizedSchoolState === normalizedState ||
      normalizedSchoolState === normalizedCommitState ||
      normalizedState === normalizedSchoolState;

    if (!stateMatches) continue;

    // City should match (fuzzy)
    const cityMatches =
      normalizedSchoolCity === normalizedCommitCity ||
      normalizedSchoolCity.includes(normalizedCommitCity) ||
      normalizedCommitCity.includes(normalizedSchoolCity);

    if (!cityMatches) continue;

    // Calculate name similarity score
    const nameScore = calculateSimilarity(
      normalizedCommitName,
      normalizedSchoolName
    );

    // Prefer exact or very close matches
    if (nameScore > bestScore && nameScore > 0.7) {
      bestScore = nameScore;
      bestMatch = school;
    }
  }

  return bestMatch;
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  // Exact match
  if (str1 === str2) return 1.0;

  // Check if one contains the other
  if (str1.includes(str2) || str2.includes(str1)) return 0.9;

  // Check for common words (university, college, etc.)
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  const commonWords = words1.filter((w) => w.length > 3 && words2.includes(w));
  if (commonWords.length > 0) {
    const similarity =
      commonWords.length / Math.max(words1.length, words2.length);
    if (similarity > 0.5) return similarity;
  }

  // Simple character overlap
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  return matches / longer.length;
}
