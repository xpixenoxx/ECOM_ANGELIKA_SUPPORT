'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface AdminProductReview {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  quality_rating: number | null;
  fit_rating: number | null;
  is_verified_purchase: boolean;
  is_published: boolean;
  helpful_count: number;
  reviewer_name: string;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    category_id?: string;
    image_url?: string;
  };
}

export interface ProductWithReviewStats {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string | null;
  category_name?: string;
  is_active: boolean;
  image_url: string;
  reviews_count: number;
  published_count: number;
  average_rating: number;
  reviews: AdminProductReview[];
}

export async function getAllProductsWithReviews(): Promise<{
  products: ProductWithReviewStats[];
  allReviews: AdminProductReview[];
  stats: {
    totalProducts: number;
    totalReviews: number;
    publishedReviews: number;
    averageRating: number;
  };
}> {
  try {
    // 1. Fetch all products with primary images
    let rawProductsData: any[] = [];
    const { data: rawProducts, error: pErr } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        sku,
        slug,
        name,
        category_id,
        is_active,
        category:categories!products_category_id_fkey(name),
        product_images(url, is_primary, sort_order)
      `)
      .order('name');

    if (pErr || !rawProducts) {
      console.warn('Products query with category relationship notice, falling back:', pErr);
      const { data: fallbackProducts } = await supabaseAdmin
        .from('products')
        .select(`
          id,
          sku,
          slug,
          name,
          category_id,
          is_active,
          product_images(url, is_primary, sort_order)
        `)
        .order('name');
      rawProductsData = fallbackProducts || [];
    } else {
      rawProductsData = rawProducts;
    }

    // 2. Fetch all reviews with user profiles
    const { data: rawReviews, error: rErr } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        user:profiles(full_name, email, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (rErr) {
      console.error('Failed to fetch reviews:', rErr);
    }

    const reviewsByProductId: Record<string, AdminProductReview[]> = {};
    const allFormattedReviews: AdminProductReview[] = [];

    // Map raw reviews
    (rawReviews || []).forEach((r: any) => {
      const measurements = (r.user_measurements && typeof r.user_measurements === 'object') ? r.user_measurements : {};
      const reviewerName = r.user?.full_name || measurements.reviewer_name || 'Verified Customer';

      const formatted: AdminProductReview = {
        id: r.id,
        product_id: r.product_id,
        user_id: r.user_id,
        rating: Number(r.rating) || 5,
        title: r.title,
        body: r.body,
        quality_rating: r.quality_rating,
        fit_rating: r.fit_rating,
        is_verified_purchase: Boolean(r.is_verified_purchase),
        is_published: Boolean(r.is_published),
        helpful_count: r.helpful_count || 0,
        reviewer_name: reviewerName,
        photos: r.photos || null,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };

      if (!reviewsByProductId[r.product_id]) {
        reviewsByProductId[r.product_id] = [];
      }
      reviewsByProductId[r.product_id]!.push(formatted);
      allFormattedReviews.push(formatted);
    });

    let totalRatingSum = 0;
    let publishedCount = 0;

    // Map products with review stats
    const products: ProductWithReviewStats[] = (rawProductsData || []).map((p: any) => {
      const images = p.product_images || [];
      const primaryImg = images.find((i: any) => i.is_primary)?.url || images[0]?.url || '/images/placeholder.jpg';
      const categoryName = p.category?.name || p.categories?.name || 'Couture';
      const productReviews = reviewsByProductId[p.id] || [];

      // Link product metadata back to reviews for flat view
      productReviews.forEach((rev) => {
        rev.product = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          category_id: p.category_id,
          image_url: primaryImg,
        };
      });

      const published = productReviews.filter(r => r.is_published);
      const avgRating = published.length > 0
        ? Math.round((published.reduce((s, r) => s + r.rating, 0) / published.length) * 10) / 10
        : 0;

      publishedCount += published.length;
      totalRatingSum += published.reduce((s, r) => s + r.rating, 0);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || '',
        category_id: p.category_id,
        category_name: categoryName,
        is_active: Boolean(p.is_active),
        image_url: primaryImg,
        reviews_count: productReviews.length,
        published_count: published.length,
        average_rating: avgRating,
        reviews: productReviews,
      };
    });

    const averageRating = publishedCount > 0 ? Math.round((totalRatingSum / publishedCount) * 10) / 10 : 0;

    const productsMap = new Map(products.map(p => [p.id, p]));
    allFormattedReviews.forEach(rev => {
      if (!rev.product) {
        const p = productsMap.get(rev.product_id);
        if (p) {
          rev.product = {
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            category_id: p.category_id || undefined,
            image_url: p.image_url,
          };
        }
      }
    });

    return {
      products,
      allReviews: allFormattedReviews,
      stats: {
        totalProducts: products.length,
        totalReviews: allFormattedReviews.length,
        publishedReviews: publishedCount,
        averageRating,
      },
    };
  } catch (err) {
    console.error('getAllProductsWithReviews unexpected error:', err);
    return {
      products: [],
      allReviews: [],
      stats: { totalProducts: 0, totalReviews: 0, publishedReviews: 0, averageRating: 0 },
    };
  }
}

export async function updateAdminReview(
  reviewId: string,
  data: {
    rating?: number;
    title?: string;
    body?: string;
    reviewer_name?: string;
    is_verified_purchase?: boolean;
    is_published?: boolean;
    quality_rating?: number;
    fit_rating?: number;
    product_slug?: string;
  }
): Promise<{ success: boolean; error?: string; data?: AdminProductReview }> {
  try {
    // 1. Fetch current review to preserve measurements
    const { data: current, error: cErr } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .maybeSingle();

    if (cErr || !current) {
      return { success: false, error: 'Review not found in database' };
    }

    const currentMeasurements = (current.user_measurements && typeof current.user_measurements === 'object')
      ? current.user_measurements
      : {};

    const updatedMeasurements = {
      ...currentMeasurements,
      reviewer_name: (data.reviewer_name || '').trim() || currentMeasurements.reviewer_name || 'Customer',
    };

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
      user_measurements: updatedMeasurements,
    };

    if (data.rating !== undefined) updates['rating'] = Math.max(1, Math.min(5, Number(data.rating)));
    if (data.title !== undefined) updates['title'] = data.title.trim() || null;
    if (data.body !== undefined) updates['body'] = data.body.trim() || null;
    if (data.is_verified_purchase !== undefined) updates['is_verified_purchase'] = Boolean(data.is_verified_purchase);
    if (data.is_published !== undefined) updates['is_published'] = Boolean(data.is_published);
    if (data.quality_rating !== undefined) updates['quality_rating'] = Number(data.quality_rating) || null;
    if (data.fit_rating !== undefined) updates['fit_rating'] = Number(data.fit_rating) || null;

    const { data: updated, error: uErr } = await supabaseAdmin
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (uErr) {
      console.error('Failed to update review:', uErr);
      return { success: false, error: uErr.message };
    }

    // Revalidate storefront and admin paths immediately
    revalidatePath('/admin/products/reviews');
    if (data.product_slug) {
      revalidatePath(`/product/${data.product_slug}`);
    }
    revalidatePath('/shop');

    const formatted: AdminProductReview = {
      id: updated.id,
      product_id: updated.product_id,
      user_id: updated.user_id,
      rating: updated.rating,
      title: updated.title,
      body: updated.body,
      quality_rating: updated.quality_rating,
      fit_rating: updated.fit_rating,
      is_verified_purchase: updated.is_verified_purchase,
      is_published: updated.is_published,
      helpful_count: updated.helpful_count || 0,
      reviewer_name: updatedMeasurements.reviewer_name,
      photos: updated.photos,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };

    return { success: true, data: formatted };
  } catch (err: any) {
    console.error('updateAdminReview unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to update review' };
  }
}

export async function createAdminReview(
  productId: string,
  data: {
    rating: number;
    title: string;
    body: string;
    reviewer_name: string;
    is_verified_purchase: boolean;
    is_published: boolean;
    quality_rating?: number;
    fit_rating?: number;
    product_slug?: string;
  }
): Promise<{ success: boolean; error?: string; data?: AdminProductReview }> {
  try {
    const reviewerName = (data.reviewer_name || '').trim() || 'Verified Customer';

    const insertPayload = {
      product_id: productId,
      rating: Math.max(1, Math.min(5, Number(data.rating))),
      title: data.title.trim() || null,
      body: data.body.trim() || null,
      quality_rating: data.quality_rating || null,
      fit_rating: data.fit_rating || null,
      is_verified_purchase: Boolean(data.is_verified_purchase),
      is_published: Boolean(data.is_published),
      helpful_count: 0,
      user_measurements: { reviewer_name: reviewerName },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabaseAdmin
      .from('reviews')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Failed to create review:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products/reviews');
    if (data.product_slug) {
      revalidatePath(`/product/${data.product_slug}`);
    }
    revalidatePath('/shop');

    const formatted: AdminProductReview = {
      id: created.id,
      product_id: created.product_id,
      user_id: created.user_id,
      rating: created.rating,
      title: created.title,
      body: created.body,
      quality_rating: created.quality_rating,
      fit_rating: created.fit_rating,
      is_verified_purchase: created.is_verified_purchase,
      is_published: created.is_published,
      helpful_count: created.helpful_count || 0,
      reviewer_name: reviewerName,
      photos: created.photos,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };

    return { success: true, data: formatted };
  } catch (err: any) {
    console.error('createAdminReview unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to create review' };
  }
}

export async function toggleReviewPublished(
  reviewId: string,
  is_published: boolean,
  product_slug?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('reviews')
      .update({ is_published, updated_at: new Date().toISOString() })
      .eq('id', reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products/reviews');
    if (product_slug) {
      revalidatePath(`/product/${product_slug}`);
    }
    revalidatePath('/shop');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to toggle status' };
  }
}

export async function deleteAdminReview(
  reviewId: string,
  product_slug?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products/reviews');
    if (product_slug) {
      revalidatePath(`/product/${product_slug}`);
    }
    revalidatePath('/shop');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete review' };
  }
}

