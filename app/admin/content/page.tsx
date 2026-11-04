'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { cn } from '@/lib/utils/cn';

const contentSections = [
  { id: 'hero', label: 'Homepage Hero', type: 'hero' },
  { id: 'features', label: 'Features Section', type: 'features' },
  { id: 'categories', label: 'Category Showcase', type: 'categories' },
  { id: 'vidhyas-picks', label: "Vidhya's Picks", type: 'editorial' },
  { id: 'brand-story', label: 'Brand Story', type: 'richtext' },
  { id: 'newsletter', label: 'Newsletter Signup', type: 'form' },
  { id: 'about-hero', label: 'About Page Hero', type: 'hero' },
  { id: 'founder-note', label: "Founder's Note", type: 'richtext' },
  { id: 'values', label: 'Our Values', type: 'grid' },
  { id: 'journey', label: 'Journey Timeline', type: 'timeline' },
  { id: 'team', label: 'Team Members', type: 'grid' },
  { id: 'artisan-story', label: 'Artisan Spotlight', type: 'richtext' },
];

const mockContent = {
  'hero': {
    title: 'Crafted with Intention, Worn with Pride',
    subtitle: 'Discover handcrafted ethnic wear that tells a story. Every piece curated by Vidhya.',
    ctaText: 'Shop Collection',
    ctaLink: '/shop',
    secondaryCtaText: "View Vidhya's Picks",
    secondaryCtaLink: "/vidhyas-picks",
    backgroundImage: '/images/home-hero.jpg',
  },
  'features': {
    items: [
      { icon: '🚚', title: 'Free Shipping', desc: 'On orders ₹2,999+ across India' },
      { icon: '🔄', title: '15-Day Returns', desc: 'Hassle-free returns & exchanges' },
      { icon: '💬', title: 'Personal Styling', desc: 'Chat with Vidhya on WhatsApp' },
      { icon: '🎁', title: 'Gift Wrapping', desc: 'Complimentary on all orders' },
    ],
  },
  'vidhyas-picks': {
    title: "Vidhya's Monthly Edit",
    subtitle: 'Handpicked favorites with personal styling notes',
    currentMonth: 'January 2026',
    theme: 'New Beginnings in Silk',
    note: 'Starting the year with fabrics that feel like fresh starts...',
    products: ['prod-1', 'prod-2', 'prod-3'],
  },
};

const mediaItems = [
  { id: 'img-1', name: 'home-hero.jpg', type: 'image', size: '2.4 MB', url: '/images/home-hero.jpg', usedIn: ['Homepage Hero', 'About Page'] },
  { id: 'img-2', name: 'vidhya-founder.jpg', type: 'image', size: '1.8 MB', url: '/images/vidhya-founder.jpg', usedIn: ['About Page', 'Founder Note'] },
  { id: 'img-3', name: 'artisan-workshop.jpg', type: 'image', size: '3.1 MB', url: '/images/artisan-workshop.jpg', usedIn: ['Artisan Stories'] },
  { id: 'img-4', name: 'product-1.jpg', type: 'image', size: '890 KB', url: '/images/product-1.jpg', usedIn: ['Product: Cotton Anarkali'] },
  { id: 'img-5', name: 'product-2.jpg', type: 'image', size: '920 KB', url: '/images/product-2.jpg', usedIn: ['Product: Silk Palazzo'] },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('sections');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setFormData(mockContent[sectionId as keyof typeof mockContent] || {});
  };

  const handleSave = () => {
    // In real app: save to Supabase
    alert(`Saved ${editingSection}! Changes will be live after deployment.`);
    setEditingSection(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Content Management</h1>
          <p className="text-[var(--color-slate)] mt-1">Zero-code editing for Vidhya - update text, images, and layout without developers</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="sections" onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex gap-2 mb-6">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="pages">Static Pages</TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <motion.div
            className="grid lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Sections List */}
            <div className="lg:col-span-1">
              <Card variant="elevated" padding="none">
                <CardHeader className="p-4 border-b border-[var(--color-whisper)]">
                  <CardTitle className="text-[var(--font-display)] text-base">Editable Sections</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[var(--color-whisper)]">
                    {contentSections.map((section) => (
                      <motion.div
                        key={section.id}
                        className={cn(
                          'p-4 hover:bg-[var(--color-snow)] transition-colors cursor-pointer border-l-4',
                          editingSection === section.id ? 'bg-[var(--color-gold-light)] border-[var(--color-gold)]' : 'border-transparent'
                        )}
                        onClick={() => handleEdit(section.id)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-[var(--color-ink)] text-sm">{section.label}</h4>
                          <Badge variant="outline" className="text-[10px] capitalize">{section.type}</Badge>
                        </div>
                        <p className="text-xs text-[var(--color-slate)]">Click to edit</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Editor Panel */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {editingSection ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">{contentSections.find(s => s.id === editingSection)?.type}</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">{contentSections.find(s => s.id === editingSection)?.label}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Dynamic form based on section type */}
                        {editingSection === 'hero' && (
                          <div>
                            <Input label="Main Headline" value={formData['title']} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            <Textarea label="Subtitle" value={formData['subtitle']} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} rows={3} />
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Input label="Primary CTA Text" value={formData['ctaText']} onChange={(e) => setFormData({...formData, ctaText: e.target.value})} />
                              <Input label="Primary CTA Link" value={formData['ctaLink']} onChange={(e) => setFormData({...formData, ctaLink: e.target.value})} />
                              <Input label="Secondary CTA Text" value={formData['secondaryCtaText']} onChange={(e) => setFormData({...formData, secondaryCtaText: e.target.value})} />
                              <Input label="Secondary CTA Link" value={formData['secondaryCtaLink']} onChange={(e) => setFormData({...formData, secondaryCtaLink: e.target.value})} />
                            </div>
                            <Input label="Background Image URL" value={formData['backgroundImage']} onChange={(e) => setFormData({...formData, backgroundImage: e.target.value})} />
                          </div>
                        )}
                        {editingSection === 'features' && (
                          <div>
                            <p className="text-sm text-[var(--color-slate)] mb-4">Edit the 4 feature cards shown on homepage</p>
                            {(formData['items'] as any[])?.map((item: any, i: number) => (
                              <div key={i} className="p-4 border border-[var(--color-whisper)] rounded-[var(--radius-lg)] mb-4">
                                <div className="grid sm:grid-cols-3 gap-4">
                                  <Input label="Icon/Emoji" value={item.icon} onChange={(e) => { const items = [...(formData['items'] as any[])]; items[i] = {...items[i], icon: e.target.value}; setFormData({...formData, items}); }} />
                                  <Input label="Title" value={item.title} onChange={(e) => { const items = [...(formData['items'] as any[])]; items[i] = {...items[i], title: e.target.value}; setFormData({...formData, items}); }} />
                                  <Textarea label="Description" value={item.desc} onChange={(e) => { const items = [...(formData['items'] as any[])]; items[i] = {...items[i], desc: e.target.value}; setFormData({...formData, items}); }} rows={2} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {editingSection === 'vidhyas-picks' && (
                          <div>
                            <Input label="Section Title" value={formData['title']} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            <Textarea label="Subtitle" value={formData['subtitle']} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} rows={2} />
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Input label="Current Month" value={formData['currentMonth']} onChange={(e) => setFormData({...formData, currentMonth: e.target.value})} />
                              <Input label="Theme" value={formData['theme']} onChange={(e) => setFormData({...formData, theme: e.target.value})} />
                            </div>
                            <Textarea label="Vidhya's Note" value={formData['note']} onChange={(e) => setFormData({...formData, note: e.target.value})} rows={4} />
                            <div>
                              <label className="input-label">Featured Product IDs (comma-separated)</label>
                              <Input value={formData['products']?.join(', ') || ''} onChange={(e) => setFormData({...formData, products: e.target.value.split(',').map(s => s.trim())})} placeholder="prod-1, prod-2, prod-3" />
                            </div>
                          </div>
                        )}
                        {editingSection === 'founder-note' && (
                          <div>
                            <Textarea label="Founder's Quote" value={formData['quote']} onChange={(e) => setFormData({...formData, quote: e.target.value})} rows={4} placeholder='"I started Angelika because..."' />
                            <Textarea label="Full Story" value={formData['story']} onChange={(e) => setFormData({...formData, story: e.target.value})} rows={8} placeholder="Tell your story..." />
                          </div>
                        )}
                        {!['hero', 'features', 'vidhyas-picks', 'founder-note'].includes(editingSection) && (
                          <div className="text-center py-8">
                            <p className="text-[var(--color-slate)] mb-4">Editor for "{contentSections.find(s => s.id === editingSection)?.label}" coming soon.</p>
                            <p className="text-sm text-[var(--color-mist)]">This will include appropriate fields for {contentSections.find(s => s.id === editingSection)?.type} content type.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant="outlined" padding="lg" className="text-center h-full min-h-[400px] flex flex-col justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-[var(--radius-xl)] bg-[var(--color-gold-light)] flex items-center justify-center text-3xl">✏️</div>
                    <h3 className="text-[var(--font-display)] text-xl text-[var(--color-ink)] mb-2">Select a Section to Edit</h3>
                    <p className="text-[var(--color-slate)]">Choose from the sidebar to edit homepage sections, about page content, or other site content.</p>
                  </Card>
                )}
              </motion.div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="media">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">Media Library</h2>
                <p className="text-[var(--color-slate)]">Manage images and assets used across the site</p>
              </div>
              <Button variant="primary">Upload Files</Button>
            </div>

            <Card variant="elevated" padding="none">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                  {mediaItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 }}
                    >
                      <div className="aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-whisper)]">
                        <Image src={item.url} alt={item.name} fill className="object-cover" sizes="200px" />
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-[var(--color-ink)] truncate text-sm">{item.name}</p>
                        <p className="text-xs text-[var(--color-slate)]">{item.type} • {item.size}</p>
                        <p className="text-xs text-[var(--color-gold)] mt-1">Used in: {item.usedIn.length} places</p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="p-1.5 bg-[var(--color-white)]/90 rounded-full">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 10l-5 5-5-5M12 15V3" /></svg>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Blog Posts Tab */}
        <TabsContent value="blog">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">Blog & Editorials</h2>
                <p className="text-[var(--color-slate)]">Styling guides, artisan stories, and brand updates</p>
              </div>
              <Button variant="primary">New Post</Button>
            </div>

            <Card variant="elevated" padding="none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { title: 'How to Drape a Saree: 5 Modern Styles', category: 'Styling Guide', status: 'Published', date: '2026-01-15' },
                      { title: 'The Art of Banarasi Weaving', category: 'Artisan Story', status: 'Published', date: '2026-01-08' },
                      { title: 'Winter Wedding Guest Outfit Ideas', category: 'Styling Guide', status: 'Draft', date: '—' },
                      { title: 'Meet Ramesh-ji: 40 Years of Weaving', category: 'Artisan Story', status: 'Scheduled', date: '2026-01-25' },
                    ].map((post, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={post.status === 'Published' ? 'success' : post.status === 'Draft' ? 'outline' : 'warning'}>{post.status}</Badge>
                        </TableCell>
                        <TableCell>{post.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="p-1.5">Edit</Button>
                            <Button variant="ghost" size="sm" className="p-1.5">View</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Static Pages Tab */}
        <TabsContent value="pages">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">Static Pages</h2>
                <p className="text-[var(--color-slate)]">Manage content for static pages</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'About Us', slug: 'about', status: 'Published', lastEdited: '2026-01-10' },
                { title: 'Contact', slug: 'contact', status: 'Published', lastEdited: '2026-01-05' },
                { title: 'FAQ', slug: 'faq', status: 'Published', lastEdited: '2026-01-12' },
                { title: 'Size Guide', slug: 'size-finder', status: 'Published', lastEdited: '2026-01-08' },
                { title: 'Shipping Policy', slug: 'shipping', status: 'Draft', lastEdited: '2026-01-01' },
                { title: 'Returns Policy', slug: 'returns', status: 'Draft', lastEdited: '2026-01-01' },
              ].map((page) => (
                <motion.div
                  key={page.slug}
                  className="p-4 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)] hover:shadow-[var(--shadow-md)] transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[var(--font-display)] text-base font-medium text-[var(--color-ink)]">{page.title}</h3>
                    <Badge variant={page.status === 'Published' ? 'success' : 'outline'}>{page.status}</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-slate)] mb-3">/{page.slug}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/content/pages/${page.slug}`}>Edit</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">View</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}