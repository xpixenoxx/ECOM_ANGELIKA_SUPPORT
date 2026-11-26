-- 20261121_content_blocks_type_check.sql
-- Relax content_blocks_type_check constraint on public.content_blocks
-- to allow all CMS section types and system blocks.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_blocks_type_check'
      AND conrelid = 'public.content_blocks'::regclass
  ) THEN
    ALTER TABLE public.content_blocks DROP CONSTRAINT content_blocks_type_check;
  END IF;
END $$;
