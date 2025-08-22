BEGIN;

-- === PantsSize additions (safe additive) ===
ALTER TYPE "PantsSize" ADD VALUE IF NOT EXISTS 'SIZE_27';
ALTER TYPE "PantsSize" ADD VALUE IF NOT EXISTS 'SIZE_28';

-- === Regions addition (safe additive) ===
ALTER TYPE "Regions" ADD VALUE IF NOT EXISTS 'SOUTHWEST';

-- === StirrupSize full replace with data mapping ===
-- 1) Create the new enum with desired values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StirrupSize_new') THEN
    CREATE TYPE "StirrupSize_new" AS ENUM ('ADULT','ADULT_LONG','XL','XL_WIDE');
  END IF;
END$$;

-- 2) Remap Player.stirrupSize to the new enum, converting old -> new
ALTER TABLE "Player"
  ALTER COLUMN "stirrupSize" TYPE "StirrupSize_new"
  USING CASE "stirrupSize"::text
           WHEN 'SM' THEN 'ADULT'
           WHEN 'LG' THEN 'ADULT_LONG'
           WHEN 'XL' THEN 'XL'
           ELSE 'ADULT'
         END::"StirrupSize_new";

-- 3) Drop old enum and rename new to final name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StirrupSize') THEN
    DROP TYPE "StirrupSize";
  END IF;
END$$;

ALTER TYPE "StirrupSize_new" RENAME TO "StirrupSize";

COMMIT;
