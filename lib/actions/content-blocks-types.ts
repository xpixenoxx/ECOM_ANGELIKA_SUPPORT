// ============================================
// CONTENT BLOCK TYPES
// ============================================

export interface ContentBlock {
  id: string;
  key: string;
  type: string;
  title: string | null;
  content: any;
  settings: any;
  is_active: boolean;
  published_at: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ContentBlockInput {
  key: string;
  type: string;
  title?: string | null;
  content?: any;
  settings?: any;
  is_active?: boolean;
  published_at?: string | null;
}

export interface ContentBlockListResult {
  success: boolean;
  blocks?: ContentBlock[];
  error?: string;
}

export interface ContentBlockSingleResult {
  success: boolean;
  block?: ContentBlock;
  error?: string;
}

export interface ContentBlockMutationResult {
  success: boolean;
  block?: ContentBlock;
  error?: string;
}

// ============================================
// CONTENT BLOCK TYPES (for UI)
// ============================================

export const CONTENT_BLOCK_TYPES = [
  { value: 'hero', label: 'Hero Section', description: 'Full-width hero banner with CTA' },
  { value: 'banner', label: 'Promotional Banner', description: 'Horizontal banner for promotions' },
  { value: 'featured_collection', label: 'Featured Collection', description: 'Grid of featured products' },
  { value: 'category_grid', label: 'Category Grid', description: 'Grid of category links' },
  { value: 'text_block', label: 'Rich Text Block', description: 'Formatted text content' },
  { value: 'image_gallery', label: 'Image Gallery', description: 'Grid/carousel of images' },
  { value: 'testimonial', label: 'Testimonial Slider', description: 'Customer testimonials carousel' },
  { value: 'newsletter', label: 'Newsletter Signup', description: 'Email capture form' },
  { value: 'instagram_feed', label: 'Instagram Feed', description: 'Instagram posts grid' },
  { value: 'video_banner', label: 'Video Banner', description: 'Video background section' },
  { value: 'split_layout', label: 'Split Layout', description: 'Two-column image + text' },
  { value: 'stats_bar', label: 'Stats Bar', description: 'Key metrics/numbers display' },
] as const;

export type ContentBlockType = typeof CONTENT_BLOCK_TYPES[number]['value'];

// ============================================
// DEFAULT SCHEMAS PER TYPE
// ============================================

export const CONTENT_BLOCK_DEFAULT_CONTENT: Record<ContentBlockType, any> = {
  hero: {
    headline: 'Discover Timeless Elegance',
    subheadline: 'Handcrafted Indian fashion for the modern woman',
    cta_text: 'Shop New Arrivals',
    cta_link: '/shop',
    background_image: '',
    overlay_opacity: 0.4,
  },
  banner: {
    text: 'Free shipping on orders above ₹2,999',
    link_text: 'Shop Now',
    link_url: '/shop',
    background_color: '#1a1a2e',
    text_color: '#F3EEE8',
  },
  featured_collection: {
    collection_id: '',
    title: 'Featured Collection',
    subtitle: 'Handpicked favorites',
    product_limit: 8,
    view_all_link: '/shop',
  },
  category_grid: {
    categories: [],
    title: 'Shop by Category',
    subtitle: 'Explore our collections',
    columns: 4,
  },
  text_block: {
    content: '<p>Your content here...</p>',
    alignment: 'center',
  },
  image_gallery: {
    images: [],
    layout: 'grid',
    columns: 3,
    gap: 'md',
  },
  testimonial: {
    testimonials: [
      { quote: '', author: '', role: '', avatar: '' },
    ],
    autoplay: true,
    interval: 5000,
  },
  newsletter: {
    headline: 'Join Our Community',
    subheadline: 'Get 10% off your first order',
    placeholder: 'Enter your email',
    button_text: 'Subscribe',
    background_image: '',
  },
  instagram_feed: {
    username: 'angelikafashions',
    post_limit: 6,
    title: 'Follow Us @angelikafashions',
  },
  video_banner: {
    video_url: '',
    poster_image: '',
    headline: '',
    subheadline: '',
    cta_text: '',
    cta_link: '',
    muted: true,
    loop: true,
  },
  split_layout: {
    left_content: { type: 'image', image: '', alt: '' },
    right_content: { type: 'text', title: '', description: '', cta_text: '', cta_link: '' },
    reverse_on_mobile: false,
  },
  stats_bar: {
    stats: [
      { value: '500+', label: 'Happy Customers' },
      { value: '50+', label: 'Designs' },
      { value: '100%', label: 'Authentic' },
      { value: '24/7', label: 'Support' },
    ],
    background_color: '#f8f5f0',
  },
};

export const CONTENT_BLOCK_DEFAULT_SETTINGS: Record<ContentBlockType, any> = {
  hero: { full_width: true, min_height: '60vh', parallax: false },
  banner: { full_width: true, padding: 'py-8' },
  featured_collection: { carousel: false, show_price: true, show_quick_view: true },
  category_grid: { show_product_count: false, hover_effect: 'zoom' },
  text_block: { max_width: 'prose', padding: 'py-12' },
  image_gallery: { lightbox: true, aspect_ratio: '4:5' },
  testimonial: { show_avatars: true, show_roles: true, dots: true },
  newsletter: { inline: false, success_message: 'Thanks for subscribing!' },
  instagram_feed: { show_captions: false, link_to_instagram: true },
  video_banner: { autoplay: true, controls: false, full_width: true },
  split_layout: { gap: 'lg', vertical_align: 'center' },
  stats_bar: { divider: true, icon_size: 'md' },
};