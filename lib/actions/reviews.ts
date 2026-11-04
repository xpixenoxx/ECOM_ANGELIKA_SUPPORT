'use server';

import { createClient } from '@/lib/supabase/server';

async function getSupabaseClient() {
  return createClient();
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  body_hi: string | null;
  quality_rating: number | null;
  fit_rating: number | null;
  photos: string[] | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  is_published: boolean;
  vendor_response: string | null;
  vendor_responded_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  verifiedPurchaseCount: number;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
  bodyHi?: string;
  qualityRating?: number;
  fitRating?: number;
  photos?: string[];
  orderItemId?: string;
}

export async function getProductReviews(
  productId: string,
  options: {
    limit?: number;
    offset?: number;
    includeUnpublished?: boolean;
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  } = {}
): Promise<{ reviews: Review[]; totalCount: number }> {
  const supabase = await getSupabaseClient();

  const {
    limit = 10,
    offset = 0,
    includeUnpublished = false,
    sortBy = 'newest',
  } = options;

  let query = supabase
    .from('reviews')
    .select(
      `
      *,
      user:profiles!reviews_user_id_fkey(full_name, avatar_url)
    `,
      { count: 'exact' }
    )
    .eq('product_id', productId);

  if (!includeUnpublished) {
    query = query.eq('is_published', true);
  }

  // Sorting
  switch (sortBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highest':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest':
      query = query.order('rating', { ascending: true });
      break;
    case 'helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    default: // newest
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data: reviews, error, count } = await query;

  if (error || !reviews) {
    return { reviews: [], totalCount: 0 };
  }

  return {
    reviews: reviews as Review[],
    totalCount: count || 0,
  };
}

export async function getProductReviewSummary(productId: string): Promise<ReviewSummary> {
  const supabase = await getSupabaseClient();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating, is_verified_purchase')
    .eq('product_id', productId)
    .eq('is_published', true);

  if (error || !reviews) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      verifiedPurchaseCount: 0,
    };
  }

  const totalReviews = reviews.length;
  const sumRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = totalReviews > 0 ? sumRating / totalReviews : 0;

  const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let verifiedPurchaseCount = 0;

  for (const review of reviews) {
    const rating = Math.round(review.rating || 0);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    }
    if (review.is_verified_purchase) {
      verifiedPurchaseCount++;
    }
  }

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution,
    verifiedPurchaseCount,
  };
}

export async function createReview(
  userId: string,
  data: CreateReviewData
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  const supabase = await getSupabaseClient();

  try {
    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', data.productId)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      return { success: false, error: 'You have already reviewed this product' };
    }

    // Check if it's a verified purchase (user bought this product)
    let isVerifiedPurchase = false;
    if (data.orderItemId) {
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('id, order_id, product_id')
        .eq('id', data.orderItemId)
        .eq('product_id', data.productId)
        .single();

      if (orderItem) {
        const { data: order } = await supabase
          .from('orders')
          .select('id, user_id, order_status')
          .eq('id', orderItem.order_id)
          .eq('user_id', userId)
          .in('order_status', ['delivered', 'completed'])
          .single();

        if (order) {
          isVerifiedPurchase = true;
        }
      }
    }

    // If no orderItemId provided, try to find if user purchased this product
    if (!isVerifiedPurchase && !data.orderItemId) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(
          `
          id,
          order:orders!order_items_order_id_fkey(id, user_id, order_status)
        `
        )
        .eq('product_id', data.productId);

      if (orderItems) {
        const hasDeliveredOrder = orderItems.some(
          (item: any) => item.order?.user_id === userId && ['delivered', 'completed'].includes(item.order?.order_status)
        );
        if (hasDeliveredOrder) {
          isVerifiedPurchase = true;
        }
      }
    }

    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        product_id: data.productId,
        rating: data.rating,
        title: data.title || null,
        body: data.body || null,
        body_hi: data.bodyHi || null,
        quality_rating: data.qualityRating || null,
        fit_rating: data.fitRating || null,
        photos: data.photos || null,
        is_verified_purchase: isVerifiedPurchase,
        order_item_id: data.orderItemId || null,
        is_published: true, // Auto-publish for now, can add moderation later
      })
      .select()
      .single();

    if (reviewError || !review) {
      console.error('Review creation failed:', reviewError);
      return { success: false, error: 'Failed to submit review' };
    }

    return { success: true, reviewId: review.id };
  } catch (error) {
    console.error('Create review error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function markReviewHelpful(reviewId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseClient();

  try {
    const { error } = await supabase.rpc('increment_review_helpful', { review_id: reviewId });

    if (error) {
      console.error('Mark helpful failed:', error);
      return { success: false, error: 'Failed to mark review as helpful' };
    }

    return { success: true };
  } catch (error) {
    console.error('Mark helpful error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getUserReviews(
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ reviews: Review[]; totalCount: number }> {
  const supabase = await getSupabaseClient();

  const { limit = 10, offset = 0 } = options;

  const { data: reviews, error, count } = await supabase
    .from('reviews')
    .select(
      `
      *,
      product:products!reviews_product_id_fkey(id, name, slug, product_images!product_images_product_id_fkey(url, is_primary))
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !reviews) {
    return { reviews: [], totalCount: 0 };
  }

  return {
    reviews: reviews as Review[],
    totalCount: count || 0,
  };
}

export async function updateReview(
  reviewId: string,
  userId: string,
  data: Partial<CreateReviewData>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseClient();

  try {
    // Verify ownership
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (!existingReview || existingReview.user_id !== userId) {
      return { success: false, error: 'Review not found or unauthorized' };
    }

    const { error } = await supabase
      .from('reviews')
      .update({
        rating: data.rating,
        title: data.title,
        body: data.body,
        body_hi: data.bodyHi,
        quality_rating: data.qualityRating,
        fit_rating: data.fitRating,
        photos: data.photos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (error) {
      console.error('Review update failed:', error);
      return { success: false, error: 'Failed to update review' };
    }

    return { success: true };
  } catch (error) {
    console.error('Update review error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteReview(reviewId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseClient();

  try {
    // Verify ownership or admin
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user ? await supabase.rpc('is_admin').then(({ data }) => data) : false;

    const { data: existingReview } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (!existingReview || (existingReview.user_id !== userId && !isAdmin)) {
      return { success: false, error: 'Review not found or unauthorized' };
    }

    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error) {
      console.error('Review deletion failed:', error);
      return { success: false, error: 'Failed to delete review' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete review error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}