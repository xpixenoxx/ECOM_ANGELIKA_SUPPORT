'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { createReview } from '@/lib/actions/reviews';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';

interface WriteReviewFormProps {
  productId: string;
}

export function WriteReviewForm({ productId }: WriteReviewFormProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    body: '',
    qualityRating: 0,
    fitRating: 0,
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleQualityRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, qualityRating: rating }));
  };

  const handleFitRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, fitRating: rating }));
  };

  const handlePhotoChange = (newPhotos: string[]) => {
    setPhotos(newPhotos);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to write a review');
      return;
    }

    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.body.trim()) {
      toast.error('Please write your review');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview(user.id, {
        productId,
        rating: formData.rating,
        title: formData.title || undefined,
        body: formData.body,
        qualityRating: formData.qualityRating || undefined,
        fitRating: formData.fitRating || undefined,
        photos: photos.length > 0 ? photos : undefined,
      });

      if (result.success) {
        toast.success('Review submitted successfully!');
        setIsOpen(false);
        // Reset form
        setFormData({
          rating: 0,
          title: '',
          body: '',
          qualityRating: 0,
          fitRating: 0,
        });
        setPhotos([]);
        // Note: In a real app, you'd want to refresh the reviews list
        // This could be done via a callback or by invalidating a query
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, productId, formData, photos]);

  if (!user) {
    return (
      <MagneticButton variant="outline" className="w-full" strength={0.3} onClick={() => setIsOpen(true)}>
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
        Sign in to Write a Review
      </MagneticButton>
    );
  }

  const RatingStars = ({ rating, onChange, size = 'lg', interactive = true }: {
    rating: number;
    onChange: (r: number) => void;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
  }) => {
    const starSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
    return (
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange(star)}
            onMouseEnter={() => interactive && onChange(star)}
            disabled={!interactive}
            className={cn(
              'transition-transform duration-100',
              interactive && 'hover:scale-110 cursor-pointer',
              star <= rating ? 'text-[var(--color-gold)] fill-current' : 'text-[var(--color-whisper)]'
            )}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            aria-checked={star === rating}
            role="radio"
          >
            <svg className={starSizes[size]} viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <MagneticButton
        variant="outline"
        className="w-full"
        strength={0.3}
        onClick={() => setIsOpen(true)}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
        Write a Review
      </MagneticButton>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="write-review-title">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--color-white)]">
            <CardHeader className="p-6 border-b border-[var(--color-whisper)]">
              <div className="flex items-center justify-between">
                <CardTitle id="write-review-title" className="text-[var(--font-display)] text-xl">Write a Review</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Close">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Overall Rating */}
                <div>
                  <Label className="block mb-2">Overall Rating <span className="text-[var(--color-error)]">*</span></Label>
                  <RatingStars rating={formData.rating} onChange={handleRatingChange} size="lg" />
                  <p className="text-sm text-[var(--color-mist)] mt-1">Tap to rate</p>
                </div>

                {/* Quality Rating */}
                <div>
                  <Label className="block mb-2">Quality</Label>
                  <RatingStars rating={formData.qualityRating} onChange={handleQualityRatingChange} size="md" />
                </div>

                {/* Fit Rating */}
                <div>
                  <Label className="block mb-2">Fit</Label>
                  <RatingStars rating={formData.fitRating} onChange={handleFitRatingChange} size="md" />
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="review-title">Review Title</Label>
                  <Input
                    id="review-title"
                    placeholder="Summarize your experience..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    maxLength={100}
                  />
                </div>

                {/* Body */}
                <div>
                  <Label htmlFor="review-body" className="block mb-2">Your Review <span className="text-[var(--color-error)]">*</span></Label>
                  <Textarea
                    id="review-body"
                    placeholder="Share your detailed experience with this product..."
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    rows={5}
                    maxLength={2000}
                    required
                  />
                  <p className="text-sm text-[var(--color-mist)] mt-1">{formData.body.length}/2000 characters</p>
                </div>

                {/* Photos */}
                <div>
                  <Label className="block mb-2">Add Photos (Optional)</Label>
                  <ImageUpload
                    value={photos}
                    onChange={handlePhotoChange}
                    maxImages={5}
                    accept="image/*"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                  />
                  <p className="text-sm text-[var(--color-mist)] mt-1">Up to 5 photos, 5MB each</p>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t border-[var(--color-whisper)]">
                  <Button variant="outline" type="button" onClick={() => setIsOpen(false)} className="flex-1" disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}