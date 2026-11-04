-- ============================================================
-- Migration: Search with pgvector and Full-Text Search
-- Enables pgvector extension and creates search functions
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the search_vector tsvector column if it doesn't exist
-- (Already exists as 'unknown' type, need to ensure it's tsvector)
-- ALTER TABLE public.products ALTER COLUMN search_vector TYPE tsvector USING search_vector::tsvector;

-- 3. Create GIN index for full-text search on search_vector
CREATE INDEX IF NOT EXISTS idx_products_search_vector
ON public.products USING GIN (search_vector);

-- 4. Create HNSW index for vector similarity search on embedding
-- Note: HNSW index requires pgvector 0.5.0+
-- We'll create it after we have embeddings populated
-- CREATE INDEX IF NOT EXISTS idx_products_embedding
-- ON public.products USING hnsw (embedding vector_cosine_ops);

-- 5. Create function to update search_vector automatically
CREATE OR REPLACE FUNCTION public.update_product_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description_hi, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.tags::text, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.occasion::text, '')), 'C');
  RETURN NEW;
END;
$$;

-- 6. Create trigger to auto-update search_vector on insert/update
DROP TRIGGER IF EXISTS trigger_update_product_search_vector ON public.products;
CREATE TRIGGER trigger_update_product_search_vector
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_product_search_vector();

-- 7. Create function for full-text search
CREATE OR REPLACE FUNCTION public.search_products_fulltext(
  query_text text,
  category_filter uuid DEFAULT NULL,
  subcategory_filter uuid DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  in_stock_only boolean DEFAULT false,
  limit_count int DEFAULT 20,
  offset_count int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  compare_at_price numeric,
  images jsonb,
  category_id uuid,
  category_name text,
  category_slug text,
  rank real
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.compare_at_price,
    (
      SELECT jsonb_agg(jsonb_build_object('url', pi.url, 'alt_text', pi.alt_text, 'is_primary', pi.is_primary))
      FROM public.product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.sort_order
    ) as images,
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    ts_rank_cd(
      p.search_vector,
      websearch_to_tsquery('english', query_text),
      32 -- rank normalization
    ) as rank
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE p.is_active = true
    AND p.search_vector @@ websearch_to_tsquery('english', query_text)
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (subcategory_filter IS NULL OR p.subcategory_id = subcategory_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (NOT in_stock_only OR EXISTS (
      SELECT 1 FROM public.product_variants pv
      WHERE pv.product_id = p.id AND pv.inventory_quantity > 0 AND pv.is_active = true
    ))
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 8. Create function for semantic (vector) search
CREATE OR REPLACE FUNCTION public.search_products_semantic(
  query_embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  category_filter uuid DEFAULT NULL,
  subcategory_filter uuid DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  in_stock_only boolean DEFAULT false,
  similarity_threshold float DEFAULT 0.5,
  limit_count int DEFAULT 20,
  offset_count int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  compare_at_price numeric,
  images jsonb,
  category_id uuid,
  category_name text,
  category_slug text,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.compare_at_price,
    (
      SELECT jsonb_agg(jsonb_build_object('url', pi.url, 'alt_text', pi.alt_text, 'is_primary', pi.is_primary))
      FROM public.product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.sort_order
    ) as images,
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE p.is_active = true
    AND p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> query_embedding)) >= similarity_threshold
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (subcategory_filter IS NULL OR p.subcategory_id = subcategory_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (NOT in_stock_only OR EXISTS (
      SELECT 1 FROM public.product_variants pv
      WHERE pv.product_id = p.id AND pv.inventory_quantity > 0 AND pv.is_active = true
    ))
  ORDER BY similarity DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 9. Create hybrid search function (combines full-text + semantic)
CREATE OR REPLACE FUNCTION public.search_products_hybrid(
  query_text text,
  query_embedding vector(1536),
  category_filter uuid DEFAULT NULL,
  subcategory_filter uuid DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  in_stock_only boolean DEFAULT false,
  fulltext_weight float DEFAULT 0.5,
  semantic_weight float DEFAULT 0.5,
  similarity_threshold float DEFAULT 0.3,
  limit_count int DEFAULT 20,
  offset_count int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  compare_at_price numeric,
  images jsonb,
  category_id uuid,
  category_name text,
  category_slug text,
  combined_score float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.compare_at_price,
    (
      SELECT jsonb_agg(jsonb_build_object('url', pi.url, 'alt_text', pi.alt_text, 'is_primary', pi.is_primary))
      FROM public.product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.sort_order
    ) as images,
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    (
      fulltext_weight * COALESCE(ts_rank_cd(p.search_vector, websearch_to_tsquery('english', query_text), 32), 0) +
      semantic_weight * COALESCE(1 - (p.embedding <=> query_embedding), 0)
    ) as combined_score
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE p.is_active = true
    AND (
      (p.search_vector @@ websearch_to_tsquery('english', query_text))
      OR (p.embedding IS NOT NULL AND (1 - (p.embedding <=> query_embedding)) >= similarity_threshold)
    )
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (subcategory_filter IS NULL OR p.subcategory_id = subcategory_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (NOT in_stock_only OR EXISTS (
      SELECT 1 FROM public.product_variants pv
      WHERE pv.product_id = p.id AND pv.inventory_quantity > 0 AND pv.is_active = true
    ))
  ORDER BY combined_score DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 10. Create function for search suggestions (autocomplete)
CREATE OR REPLACE FUNCTION public.get_search_suggestions(
  prefix_text text,
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  suggestion text,
  type text, -- 'product' | 'category' | 'tag' | 'occasion'
  count int
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Product name suggestions
    SELECT
      p.name as suggestion,
      'product' as type,
      1 as count
    FROM public.products p
    WHERE p.is_active = true
      AND p.name ILIKE prefix_text || '%'
    LIMIT limit_count
  ) sub
  UNION ALL
  SELECT * FROM (
    -- Category suggestions
    SELECT
      c.name as suggestion,
      'category' as type,
      COUNT(p.id) as count
    FROM public.categories c
    LEFT JOIN public.products p ON p.category_id = c.id AND p.is_active = true
    WHERE c.is_active = true
      AND c.name ILIKE prefix_text || '%'
    GROUP BY c.id, c.name
    LIMIT limit_count
  ) sub
  UNION ALL
  SELECT * FROM (
    -- Tag suggestions (from products)
    SELECT
      tag as suggestion,
      'tag' as type,
      COUNT(*) as count
    FROM public.products p,
    LATERAL unnest(COALESCE(p.tags, ARRAY[]::text[])) as tag
    WHERE p.is_active = true
      AND tag ILIKE prefix_text || '%'
    GROUP BY tag
    LIMIT limit_count
  ) sub
  UNION ALL
  SELECT * FROM (
    -- Occasion suggestions
    SELECT
      occ as suggestion,
      'occasion' as type,
      COUNT(*) as count
    FROM public.products p,
    LATERAL unnest(COALESCE(p.occasion, ARRAY[]::text[])) as occ
    WHERE p.is_active = true
      AND occ ILIKE prefix_text || '%'
    GROUP BY occ
    LIMIT limit_count
  ) sub
  ORDER BY count DESC, suggestion
  LIMIT limit_count;
END;
$$;

-- 11. Create function to generate embeddings for existing products
-- This should be called after setting up OpenAI API key in Edge Function
-- CREATE OR REPLACE FUNCTION public.generate_product_embeddings()
-- RETURNS void LANGUAGE plpgsql AS $$
-- DECLARE
--   prod RECORD;
--   emb_response jsonb;
-- BEGIN
--   FOR prod IN SELECT id, name, description, short_description FROM public.products WHERE is_active = true AND embedding IS NULL LOOP
--     -- Call external embedding API (would need to be done via Edge Function)
--     -- This is a placeholder - actual implementation in Edge Function
--   END LOOP;
-- END;
-- $$;

-- 12. Update existing products' search_vectors
UPDATE public.products
SET search_vector = (
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(short_description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description_hi, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(tags::text, '')), 'C') ||
  setweight(to_tsvector('simple', COALESCE(occasion::text, '')), 'C')
)::tsvector
WHERE is_active = true;