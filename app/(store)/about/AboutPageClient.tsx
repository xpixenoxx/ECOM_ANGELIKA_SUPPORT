'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { cn } from '@/lib/utils/cn';
import type { AboutPageContent, AboutValueItem } from '@/lib/actions/site-content-types';

function renderValueIcon(iconName: string) {
  switch (iconName.toLowerCase()) {
    case 'shield':
      return (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'heart':
      return (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'clock':
      return (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'users':
    case 'community':
      return (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return <span className="text-2xl">{iconName || '✨'}</span>;
  }
}

export default function AboutPageClient({
  content,
}: {
  content: AboutPageContent;
}) {
  const { hero, founderNote, values, journey, team, artisanSpotlight, bottomCta } = content;

  // Split hero title to highlight words if available
  const heroTitle = hero.title || 'Crafted with Intention, Worn with Pride';
  const highlight1 = hero.titleHighlight1 || 'Intention';
  const highlight2 = hero.titleHighlight2 || 'Pride';

  const renderTitleWithHighlights = (title: string, h1?: string, h2?: string) => {
    if (!h1 && !h2) return title;

    let res = title;
    return (
      <span>
        {res.split(new RegExp(`(${h1 || '___'}|${h2 || '___'})`, 'gi')).map((part, idx) => {
          const isH1 = h1 && part.toLowerCase() === h1.toLowerCase();
          const isH2 = h2 && part.toLowerCase() === h2.toLowerCase();
          if (isH1 || isH2) {
            return (
              <span key={idx} className="text-[var(--color-gold)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* 1. Hero Section */}
      <section id="story" className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={hero.backgroundImage || '/images/about-hero.jpg'}
            alt={hero.title}
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
              {hero.badge || 'OUR STORY'}
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-white leading-tight mb-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              {renderTitleWithHighlights(heroTitle, highlight1, highlight2)}
            </h1>
            <p className="text-white text-lg md:text-xl mb-8 max-w-2xl leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] font-normal">
              {hero.description}
            </p>
            <div className="flex flex-wrap gap-4">
              {hero.primaryCtaText && (
                <MagneticButton variant="primary" size="lg" strength={0.3} asChild>
                  <Link
                    href={hero.primaryCtaLink || '/shop'}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-ink)] shadow-[var(--shadow-gold)] hover:shadow-lg transition-all"
                  >
                    {hero.primaryCtaText}
                  </Link>
                </MagneticButton>
              )}
              {hero.secondaryCtaText && (
                <MagneticButton
                  variant="outline"
                  size="lg"
                  strength={0.3}
                  className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]"
                  asChild
                >
                  <Link
                    href={hero.secondaryCtaLink || '/vidhyas-picks'}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide border-2 border-[var(--color-gold)] text-white hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition-all drop-shadow-md bg-black/20 backdrop-blur-sm"
                  >
                    {hero.secondaryCtaText}
                  </Link>
                </MagneticButton>
              )}
            </div>
          </ScrollReveal>
        </div>
        {hero.scrollText && (
          <div className="absolute bottom-10 left-6 right-6 z-10 flex justify-center">
            <ScrollReveal variant="fadeUp" delay={1} className="px-6 py-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-[var(--radius-full)] shadow-lg">
              <p className="text-white text-sm font-medium drop-shadow-sm">
                {hero.scrollText}
              </p>
            </ScrollReveal>
          </div>
        )}
      </section>

      {/* 2. Founder's Note */}
      <section id="founder" className="py-20 bg-[var(--color-snow)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[3/4] rounded-[var(--radius-2xl)] overflow-hidden">
                <Image
                  src={founderNote.image || '/images/vidhya-founder.jpg'}
                  alt={founderNote.quoteAuthor || 'Vidhya R., Founder of Angelika Fashions'}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 p-6 md:p-8 bg-[var(--color-white)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-xl)] max-w-xs">
                <p className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-gold)] mb-2">
                  {founderNote.quotePart1}
                </p>
                <p className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)] mb-2">
                  {founderNote.quotePart2}
                </p>
                <p className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-gold)]">
                  {founderNote.quotePart3}
                </p>
                {founderNote.quoteAuthor && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-whisper)]">
                    <p className="text-sm text-[var(--color-slate)]">{founderNote.quoteAuthor}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)]">
                {founderNote.badge || 'A Note from Vidhya'}
              </span>
              <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
                {founderNote.title}
              </h2>
              <div className="prose prose-[var(--color-slate)] max-w-none space-y-4 text-lg leading-relaxed">
                {(founderNote.storyParagraphs || []).map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
              {founderNote.ctaText && (
                <MagneticButton variant="whatsapp" size="lg" strength={0.3} className="gap-2" asChild>
                  <Link href={founderNote.ctaLink || 'https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya'} target="_blank" rel="noopener noreferrer">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {founderNote.ctaText}
                  </Link>
                </MagneticButton>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. Values Section */}
      <section id="values" className="py-20 bg-[var(--color-white)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
              {values.badge || 'OUR VALUES'}
            </span>
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
              {values.title || 'What We Stand For'}
            </h2>
          </ScrollReveal>
          <StaggerContainer
            variant="fast"
            className={cn('grid md:grid-cols-2 lg:grid-cols-4 gap-6')}
            as="div"
          >
            {(values.items || []).map((value: AboutValueItem, index: number) => (
              <StaggerItem key={value.title || index} variant="scale" style={{ transitionDelay: `${index * 0.1}s` }}>
                <article className="p-8 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-2xl)] hover:shadow-[var(--shadow-xl)] hover:border-[var(--color-gold)]/30 transition-all duration-500">
                  <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] mb-6">
                    {renderValueIcon(value.icon)}
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

      {/* 4. Journey Timeline */}
      <section id="journey" className="py-20 bg-[var(--color-snow)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
              {journey.badge || 'OUR JOURNEY'}
            </span>
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
              {journey.title || 'Milestones Along the Way'}
            </h2>
          </ScrollReveal>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-gold)]/30 transform -translate-x-1/2" />
            <StaggerContainer variant="default" className="space-y-12">
              {(journey.milestones || []).map((milestone, index) => (
                <StaggerItem key={milestone.year + index} variant="slide" style={{ transitionDelay: `${index * 0.1}s` }}>
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

      {/* 5. The Team */}
      <section id="team" className="py-20 bg-[var(--color-white)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
              {team.badge || 'MEET THE TEAM'}
            </span>
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
              {team.title || 'The People Behind Angelika'}
            </h2>
          </ScrollReveal>
          <StaggerContainer
            variant="fast"
            className={cn('grid md:grid-cols-2 lg:grid-cols-4 gap-8')}
            as="div"
          >
            {(team.members || []).map((member, index) => (
              <StaggerItem key={member.name + index} variant="scale" style={{ transitionDelay: `${index * 0.1}s` }}>
                <article className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[var(--color-gold)]/30">
                    <Image
                      src={member.image || '/images/team-vidhya.jpg'}
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

      {/* 6. Artisan Spotlight */}
      <section id="craft" className="py-20 bg-[var(--color-ink)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-[var(--radius-2xl)] overflow-hidden">
              <Image
                src={artisanSpotlight.image || '/images/artisan-workshop.jpg'}
                alt={artisanSpotlight.title || 'Artisan at work in Banaras workshop'}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 bg-[var(--color-gold)]/20 text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)]">
                {artisanSpotlight.badge || 'ARTISAN STORIES'}
              </span>
              <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-white)] leading-tight">
                {artisanSpotlight.title || 'Hands That Create Magic'}
              </h2>
              <div className="prose prose-invert max-w-none space-y-4 text-lg leading-relaxed text-[var(--color-white)]/80">
                {(artisanSpotlight.paragraphs || []).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              {artisanSpotlight.ctaText && (
                <MagneticButton variant="outline" size="lg" strength={0.3} className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]" asChild>
                  <Link href={artisanSpotlight.ctaLink || '/artisan-stories'}>
                    {artisanSpotlight.ctaText}
                  </Link>
                </MagneticButton>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 7. Bottom CTA Section */}
      <section className="py-20 bg-[var(--color-snow)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="max-w-3xl mx-auto text-center">
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight mb-6">
              {bottomCta.title || 'Ready to Find Your Perfect Piece?'}
            </h2>
            <p className="text-[var(--color-slate)] text-lg mb-8 max-w-xl mx-auto">
              {bottomCta.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {bottomCta.primaryCtaText && (
                <MagneticButton variant="primary" size="lg" strength={0.3} asChild>
                  <Link href={bottomCta.primaryCtaLink || '/shop'}>{bottomCta.primaryCtaText}</Link>
                </MagneticButton>
              )}
              {bottomCta.secondaryCtaText && (
                <MagneticButton variant="outline" size="lg" strength={0.3} asChild>
                  <Link href={bottomCta.secondaryCtaLink || '/size-finder'}>{bottomCta.secondaryCtaText}</Link>
                </MagneticButton>
              )}
              {bottomCta.whatsappText && (
                <MagneticButton variant="whatsapp" size="lg" strength={0.3} asChild>
                  <Link href={bottomCta.whatsappLink || 'https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya'} target="_blank" rel="noopener noreferrer">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {bottomCta.whatsappText}
                  </Link>
                </MagneticButton>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

