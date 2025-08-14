-- 0) Create a temp enum with the new labels
DO $$ BEGIN
  CREATE TYPE "Regions_tmp" AS ENUM (
    'ACADEMY','PACIFIC','MOUNTAIN','MIDWEST','NORTHEAST','SOUTHEAST','TEXAS'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1) Team.region -> Regions_tmp (map old labels to new)
ALTER TABLE "Team"
  ALTER COLUMN "region" TYPE "Regions_tmp" USING (
    CASE ("region"::text)
      WHEN 'NW' THEN 'PACIFIC'
      WHEN 'SW' THEN 'MOUNTAIN'
      WHEN 'S'  THEN 'TEXAS'
      WHEN 'SE' THEN 'SOUTHEAST'
      WHEN 'NE' THEN 'NORTHEAST'
      WHEN 'MW' THEN 'MIDWEST'
      ELSE 'ACADEMY'
    END
  )::"Regions_tmp";

-- 2) RegCoach.region -> Regions_tmp
ALTER TABLE "RegCoach"
  ALTER COLUMN "region" TYPE "Regions_tmp" USING (
    CASE ("region"::text)
      WHEN 'NW' THEN 'PACIFIC'
      WHEN 'SW' THEN 'MOUNTAIN'
      WHEN 'S'  THEN 'TEXAS'
      WHEN 'SE' THEN 'SOUTHEAST'
      WHEN 'NE' THEN 'NORTHEAST'
      WHEN 'MW' THEN 'MIDWEST'
      ELSE 'ACADEMY'
    END
  )::"Regions_tmp";

-- 3) Drop any old enums named "Region" or "Regions" (no columns use them now)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Region') THEN
    DROP TYPE "Region";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Regions') THEN
    DROP TYPE "Regions";
  END IF;
END $$;

-- 4) Rename temp -> Regions
ALTER TYPE "Regions_tmp" RENAME TO "Regions";
