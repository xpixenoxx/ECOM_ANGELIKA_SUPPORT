import { Metadata } from 'next';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem, StaggerGrid } from '@/components/animations/Stagger';
import { cn } from '@/lib/utils/cn';
import { MagneticButton } from '@/components/animations/MagneticButton';

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Discover the story behind Angelika Fashions - founded by Vidhya, bringing premium ethnic wear with a personal touch.',
};

const values = [
  {
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Authentic Craftsmanship',
    description: 'Every piece is sourced directly from artisan clusters across India - Banaras, Chanderi, Jaipur, and beyond. We honor generations of handloom weaving, block printing, and embroidery traditions.',
  },
  {
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Personal Curation',
    description: 'Vidhya personally selects every design, fabric, and color. No mass-produced trends - only pieces she would wear herself and gift to the women in her life.',
  },
  {
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Timeless Over Trendy',
    description: 'We create heirlooms, not fast fashion. Our silhouettes transcend seasons - a Banarasi saree today will be just as beautiful twenty years from now.',
  },
  {
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Community First',
    description: 'Every purchase supports artisan livelihoods. We work on fair-trade principles, ensuring craftspeople receive recognition and fair compensation for their mastery.',
  },
];

const milestones = [
  { year: '2019', title: 'The Beginning', description: 'Vidhya starts curating ethnic wear for friends and family from her living room in Bangalore.', icon: '🏠' },
  { year: '2020', title: 'First Pop-Up', description: 'First physical pop-up at a Bangalore boutique - 200 pieces sold in 3 days.', icon: '🛍️' },
  { year: '2021', title: 'Artisan Partnerships', description: 'Direct partnerships established with 12 weaving clusters across Banaras, Chanderi, and Maheshwar.', icon: '🤝' },
  { year: '2022', title: 'Online Launch', description: 'Angelika Fashions website goes live. First order shipped to Chennai within 4 hours.', icon: '💻' },
  { year: '2023', title: 'Vidhya\'s Picks', description: 'Monthly curated edit launches - personal styling notes from Vidhya for each piece.', icon: '✨' },
  { year: '2024', title: '10,000+ Customers', description: 'Community grows to 10,000+ women across India and 15 countries. Angelika Circle loyalty program launches.', icon: '👑' },
  { year: '2025', title: 'Flagship Studio', description: 'First experience studio opens in Indiranagar, Bangalore - by appointment only.', icon: '🏪' },
  { year: '2026', title: 'Today', description: 'Continuing the journey - new collections, deeper artisan relationships, and more ways to serve our community.', icon: '🌟' },
];

const team = [
  { name: 'Vidhya R.', role: 'Founder & Creative Director', bio: 'Former textile designer turned entrepreneur. Believes every woman deserves to feel like royalty in her ethnic wear.', image: '/images/team-vidhya.jpg' },
  { name: 'Priya S.', role: 'Head of Artisan Relations', bio: 'Travels to weaving villages monthly. Speaks 4 languages. Ensures every artisan feels valued and heard.', image: '/images/team-priya.jpg' },
  { name: 'Meera K.', role: 'Customer Experience Lead', bio: 'Knows 500+ customers by name. Your styling questions, size doubts, gift dilemmas - she solves them all.', image: '/images/team-meera.jpg' },
  { name: 'Arjun M.', role: 'Operations & Logistics', bio: 'Makes sure your order reaches you before the occasion. 99.2% on-time delivery rate. Obsessed with packaging.', image: '/images/team-arjun.jpg' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about-hero.jpg"
            alt="Vidhya in the Angelika studio"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)]/90 via-[var(--color-ink)]/70 to-transparent" />
        </div>
        <div className="relative z-10 container-custom px-6 py-20">
          <ScrollReveal variant="fadeUp" className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-[var(--color-gold)] text-[var(--color-ink)] text-sm font-semibold rounded-[var(--radius-full)] mb-6 tracking-wide">
              OUR STORY
            </span>
            <h1 className="text-[var(--font-display)] text-5xl md:text-7xl font-medium text-[var(--color-white)] leading-tight mb-6">
              Crafted with <span className="text-[var(--color-gold)]">Intention</span>, Worn with <span className="text-[var(--color-gold)]">Pride</span>
            </h1>
            <p className="text-[var(--color-white)]/80 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
              Angelika Fashions began with a simple belief: ethnic wear should make you feel like the best version of yourself - rooted, radiant, and entirely you.
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton variant="primary" size="lg" strength={0.3} asChild>
                <Link href="/shop">Explore Collection</Link>
              </MagneticButton>
              <MagneticButton variant="outline" size="lg" strength={0.3} className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]" asChild>
                <Link href="/vidhyas-picks">View Vidhya's Picks</Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
        <div className="absolute bottom-10 left-6 right-6 z-10 flex justify-center">
          <ScrollReveal variant="fadeUp" delay={1} className="px-6 py-3 bg-[var(--color-white)]/10 backdrop-blur-sm border border-[var(--color-white)]/20 rounded-[var(--radius-full)]">
            <p className="text-[var(--color-white)]/80 text-sm font-medium">
              Scroll to discover our journey →
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="py-20 bg-[var(--color-snow)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[3/4] rounded-[var(--radius-2xl)] overflow-hidden">
                <Image
                  src="/images/vidhya-founder.jpg"
                  alt="Vidhya R., Founder of Angelika Fashions"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 p-6 md:p-8 bg-[var(--color-white)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-xl)] max-w-xs">
                <p className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-gold)] mb-2">"I started Angelika"</p>
                <p className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)] mb-2">because I couldn't find</p>
                <p className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-gold)]">ethnic wear that felt like <em>me</em>."</p>
                <div className="mt-4 pt-4 border-t border-[var(--color-whisper)]">
                  <p className="text-sm text-[var(--color-slate)]">— Vidhya R., Founder</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)]">
                A Note from Vidhya
              </span>
              <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
                Why Angelika Exists
              </h2>
              <div className="prose prose-[var(--color-slate)] max-w-none space-y-4 text-lg leading-relaxed">
                <p>
                  Growing up in a family where textiles were dinner table conversation, I learned early that fabric carries memory.
                  My grandmother's Banarasi sarees, my mother's hand-block printed kurtas - each piece held a story.
                </p>
                <p>
                  But when I started shopping for myself, I found a gap. Mass-market ethnic wear felt impersonal - synthetic fabrics,
                  generic prints, sizing that never quite worked. The luxury boutiques were beautiful but intimidating, with price tags
                  that didn't reflect the craft.
                </p>
                <p>
                  Angelika was born from that gap. We work directly with artisan clusters - no middlemen, no markup games.
                  I personally approve every design, every colorway, every stitch. When you wear Angelika, you're wearing something
                  I'd proudly wear to my own cousin's wedding.
                </p>
                <p>
                  This isn't just a brand. It's a promise: authentic craftsmanship, honest pricing, and a personal relationship
                  with every woman who chooses us. Welcome to the family.
                </p>
              </div>
              <MagneticButton variant="whatsapp" size="lg" strength={0.3} className="gap-2" asChild>
                <Link href="https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Chat with Vidhya
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[var(--color-white)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
              OUR VALUES
            </span>
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
              What We Stand For
            </h2>
          </ScrollReveal>
          <StaggerContainer
            variant="fast"
            className={cn('grid md:grid-cols-2 lg:grid-cols-4 gap-6')}
            as="div"
          >
            {values.map((value, index) => (
              <StaggerItem key={value.title} variant="scale" style={{ transitionDelay: `${index * 0.1}s` }}>
                <article className="p-8 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-2xl)] hover:shadow-[var(--shadow-xl)] hover:border-[var(--color-gold)]/30 transition-all duration-500">
                  <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-3">
                    {value.title}
                  </h3>
                <p className="text-[var(--color-slate)] leading-relaxed">
                  {value.description}
                </p>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-[var(--color-snow)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
              OUR JOURNEY
            </span>
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
              Milestones Along the Way
            </h2>
          </ScrollReveal>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-gold)]/30 transform -translate-x-1/2" />
            <StaggerContainer variant="default" className="space-y-12">
              {milestones.map((milestone, index) => (
                <StaggerItem key={milestone.year} variant="slide" style={{ transitionDelay: `${index * 0.1}s` }}>
                  <div className="relative flex items-start gap-8">
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className="relative z-10 w-4 h-4 rounded-full bg-[var(--color-gold)] border-4 border-[var(--color-snow)]" />
                      <span className="text-sm font-mono text-[var(--color-gold)] mt-2 font-bold">{milestone.year}</span>
                    </div>
                    <div className={cn(
                      'flex-1 p-6 bg-[var(--color-white)] rounded-[var(--radius-2xl)] border border-[var(--color-whisper)]',
                      index % 2 === 0 ? 'ml-auto mr-20' : 'mr-auto ml-20'
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{milestone.icon}</span>
                        <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)]">
                          {milestone.title}
                        </h3>
                      </div>
                      <p className="text-[var(--color-slate)]">{milestone.description}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="py-20 bg-[var(--color-white)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
              MEET THE TEAM
            </span>
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
              The People Behind Angelika
            </h2>
          </ScrollReveal>
          <StaggerContainer
            variant="fast"
            className={cn('grid md:grid-cols-2 lg:grid-cols-4 gap-8')}
            as="div"
          >
            {team.map((member, index) => (
              <StaggerItem key={member.name} variant="scale" style={{ transitionDelay: `${index * 0.1}s` }}>
                <article className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[var(--color-gold)]/30">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                  <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[var(--color-gold)] text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-[var(--color-slate)] text-sm leading-relaxed">{member.bio}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Artisan Spotlight */}
      <section className="py-20 bg-[var(--color-ink)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-[var(--radius-2xl)] overflow-hidden">
              <Image
                src="/images/artisan-workshop.jpg"
                alt="Artisan at work in Banaras workshop"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 bg-[var(--color-gold)]/20 text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)]">
                ARTISAN STORIES
              </span>
              <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-white)] leading-tight">
                Hands That Create Magic
              </h2>
              <div className="prose prose-invert max-w-none space-y-4 text-lg leading-relaxed text-[var(--color-white)]/80">
                <p>
                  Behind every Angelika piece are hands that have inherited generations of knowledge.
                  In the narrow lanes of Banaras, master weavers like <strong>Ramesh-ji</strong> spend 14 days
                  on a single saree, each thread placed with intention.
                </p>
                <p>
                  In Chanderi, <strong>Meera-behen</strong> leads a collective of 40 women who hand-block print
                  our cotton kurtis using natural dyes - a skill passed from mother to daughter for three centuries.
                </p>
                <p>
                  These aren't suppliers. They're partners. We visit their workshops, share chai with their families,
                  and celebrate their festivals. When you wear Angelika, you carry their stories, their patience,
                  and their pride.
                </p>
              </div>
              <MagneticButton variant="outline" size="lg" strength={0.3} className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]" asChild>
                <Link href="/artisan-stories">Read More Artisan Stories</Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--color-snow)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="max-w-3xl mx-auto text-center">
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight mb-6">
              Ready to Find Your Perfect Piece?
            </h2>
            <p className="text-[var(--color-slate)] text-lg mb-8 max-w-xl mx-auto">
              Whether it's for a wedding, a festival, or simply because you deserve beauty in your everyday -
              we're here to help you discover it.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton variant="primary" size="lg" strength={0.3} asChild>
                <Link href="/shop">Shop Collection</Link>
              </MagneticButton>
              <MagneticButton variant="outline" size="lg" strength={0.3} asChild>
                <Link href="/size-finder">Find My Size</Link>
              </MagneticButton>
              <MagneticButton variant="whatsapp" size="lg" strength={0.3} asChild>
                <Link href="https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20need%20styling%20help" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Chat with Vidhya
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}