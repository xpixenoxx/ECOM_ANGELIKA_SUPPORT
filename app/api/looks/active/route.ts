import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();

    const { data: look, error } = await supabase
      .from('looks')
      .select(
        `
        id,
        name,
        lifestyle_image_url,
        lifestyle_image_alt,
        look_hotspots (
          id,
          x_percent,
          y_percent,
          display_order,
          products:product_id (
            id,
            slug,
            name,
            product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity, is_active),
            product_images!product_images_product_id_fkey(url, is_primary, sort_order)
          )
        )
      `
      )
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .single();

    if (error || !look) {
      return NextResponse.json(null, { status: 404 });
    }

    // Reshape into the format ShopTheLookClient expects
    const shaped = {
      id: look.id,
      name: look.name,
      lifestyle_image_url: look.lifestyle_image_url,
      lifestyle_image_alt: look.lifestyle_image_alt,
      look_hotspots: (look.look_hotspots ?? [])
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((hotspot: any) => {
          const prod = hotspot.products;
          if (!prod) return null;

          const activeVariants = (prod.product_variants ?? []).filter((v: any) => v.is_active !== false);
          const cheapest = activeVariants.sort((a: any, b: any) => Number(a.price) - Number(b.price))[0];

          const primaryImg =
            (prod.product_images ?? []).find((i: any) => i.is_primary)?.url ||
            prod.product_images?.[0]?.url ||
            '/images/placeholder.jpg';

          return {
            id: hotspot.id,
            x_percent: hotspot.x_percent,
            y_percent: hotspot.y_percent,
            display_order: hotspot.display_order,
            products: {
              id: prod.id,
              slug: prod.slug,
              name: prod.name,
              price: cheapest ? Number(cheapest.price) : 0,
              compare_at_price: cheapest?.compare_at_price ? Number(cheapest.compare_at_price) : null,
              images: (prod.product_images ?? []).map((i: any) => i.url),
              thumbnail_url: primaryImg,
              default_variant_id: cheapest?.id || prod.id,
              variants: activeVariants.map((v: any) => ({ id: v.id, size: v.size, price: Number(v.price) })),
            },
          };
        })
        .filter(Boolean),
    };

    return NextResponse.json(shaped);
  } catch (err) {
    console.error('Error fetching active look:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}