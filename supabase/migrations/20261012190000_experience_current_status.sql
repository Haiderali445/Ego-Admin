ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT false;

UPDATE public.experience
SET is_current = true
WHERE duration ILIKE '%present%'
  AND is_current = false;