'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { cn } from '@/lib/utils/cn';
import { HomepageHeroEditor } from '@/components/admin/HomepageHeroEditor';

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
    title: 'Grace in',
    subtitle: 'Timeless traditional wear for the modern woman.\nRooted in heritage, designed for your today.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: "Vidhya's Picks",
    secondaryCtaLink: "/vidhyas-picks",
    backgroundImage: '/images/hero-new-couture.jpg',
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
  { id: 'img-1', name: 'hero-new-couture.jpg', type: 'image', size: '2.4 MB', url: '/images/hero-new-couture.jpg', usedIn: ['Homepage Hero'] },
  { id: 'img-2', name: 'logo.png', type: 'image', size: '250 KB', url: '/images/logo.png', usedIn: ['Header', 'Footer'] },
  { id: 'img-3', name: 'vidhya-founder.jpg', type: 'image', size: '1.8 MB', url: '/images/vidhya-founder.jpg', usedIn: ['About Page', 'Founder Note'] },
  { id: 'img-4', name: 'artisan-workshop.jpg', type: 'image', size: '3.1 MB', url: '/images/artisan-workshop.jpg', usedIn: ['Artisan Stories'] },
  { id: 'img-5', name: 'collection-kurtis.jpg', type: 'image', size: '890 KB', url: '/images/collection-kurtis.jpg', usedIn: ['Collections: Kurtis'] },
  { id: 'img-6', name: 'collection-sarees.jpg', type: 'image', size: '920 KB', url: '/images/collection-sarees.jpg', usedIn: ['Collections: Sarees'] },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('sections');
  const [editingSection, setEditingSection] = useState<string | null>('hero');
  const [formData, setFormData] = useState<Record<string, any>>(mockContent['hero']);

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setFormData(mockContent[sectionId as keyof typeof mockContent] || {});
  };

  const handleSaveMock = () => {
    alert(`Saved ${editingSection}! Changes updated.`);
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
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Pages</h1>
          <p className="text-[var(--color-slate)] mt-1">Zero-code editing for Vidhya - update text, images, navigation, and layout without developers</p>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-xs font-semibold text-[var(--color-ink)] border border-[var(--color-whisper)] transition-colors self-start sm:self-auto"
        >
          <span>View Live Storefront</span>
          <span>↗</span>
        </Link>
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
                {editingSection === 'hero' ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">HERO</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">Homepage Hero & Header Navigation</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <HomepageHeroEditor
                        onCancel={() => setEditingSection(null)}
                        onSaved={() => {
                          // Saved hook
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : editingSection ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">{contentSections.find(s => s.id === editingSection)?.type}</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">{contentSections.find(s => s.id === editingSection)?.label}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveMock}>Save Changes</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
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
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">The Art of Hand Block Printing</TableCell>
                      <TableCell>Vidhya</TableCell>
                      <TableCell>Craft & Technique</TableCell>
                      <TableCell>Jan 15, 2026</TableCell>
                      <TableCell><Badge variant="outline">Published</Badge></TableCell>
                    </TableRow>
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
                <p className="text-[var(--color-slate)]">Manage legal pages, contact info, and policies</p>
              </div>
            </div>

            <Card variant="elevated" padding="none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">About Us</TableCell>
                      <TableCell>/about</TableCell>
                      <TableCell>Jan 10, 2026</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Shipping Policy</TableCell>
                      <TableCell>/shipping</TableCell>
                      <TableCell>Dec 20, 2025</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
