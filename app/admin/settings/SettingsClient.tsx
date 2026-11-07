'use client';

import { useState, useTransition, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Globe, Megaphone, Phone, ShoppingBag, Search, Navigation, Plus, Trash2, GripVertical, Eye, EyeOff, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import type { StoreSettings, NavbarItem } from '@/lib/actions/store-settings';
import {
  updateStoreSettings,
  createNavbarItem,
  updateNavbarItem,
  deleteNavbarItem,
  reorderNavbarItems,
} from '@/lib/actions/store-settings';

type Tab = 'branding' | 'announcement' | 'contact' | 'commerce' | 'seo' | 'navbar';

interface Props {
  initialSettings: StoreSettings | null;
  initialNavbarItems: NavbarItem[];
}

function SaveStatus({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle') return null;
  return (
    <AnimatePresence>
      <motion.span
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-1.5 text-sm font-medium ${status === 'saved' ? 'text-green-600' :
            status === 'error' ? 'text-red-500' :
              'text-[var(--color-slate)]'
          }`}
      >
        {status === 'saving' && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {status === 'saved' && <Check className="w-4 h-4" />}
        {status === 'error' && <AlertCircle className="w-4 h-4" />}
        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved!' : 'Error saving'}
      </motion.span>
    </AnimatePresence>
  );
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'branding', label: 'Branding', icon: <Globe className="w-4 h-4" /> },
  { id: 'announcement', label: 'Announcement', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact & Social', icon: <Phone className="w-4 h-4" /> },
  { id: 'commerce', label: 'Commerce', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },
  { id: 'navbar', label: 'Navbar', icon: <Navigation className="w-4 h-4" /> },
];

const inputClass = 'w-full px-3 py-2 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] transition-all';
const labelClass = 'block text-sm font-medium text-[var(--color-ink)] mb-1.5';
const cardClass = 'bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6';

export default function SettingsClient({ initialSettings, initialNavbarItems }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('branding');
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [navbarItems, setNavbarItems] = useState<NavbarItem[]>(initialNavbarItems);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<Record<Tab, 'idle' | 'saving' | 'saved' | 'error'>>({
    branding: 'idle', announcement: 'idle', contact: 'idle',
    commerce: 'idle', seo: 'idle', navbar: 'idle',
  });

  // New navbar item form
  const [newItem, setNewItem] = useState({ label: '', href: '', badge_text: '' });
  const [addingItem, setAddingItem] = useState(false);

  const setSave = (tab: Tab, s: 'idle' | 'saving' | 'saved' | 'error') => {
    setSaveStatus(prev => ({ ...prev, [tab]: s }));
    if (s === 'saved' || s === 'error') {
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [tab]: 'idle' })), 3000);
    }
  };

  const handleSave = useCallback((tab: Tab, payload: Partial<StoreSettings>) => {
    if (!settings?.id) return;
    setSave(tab, 'saving');
    startTransition(async () => {
      const res = await updateStoreSettings(settings.id, payload);
      setSave(tab, res.success ? 'saved' : 'error');
      if (res.success) setSettings(prev => prev ? { ...prev, ...payload } : prev);
    });
  }, [settings?.id]);

  const handleAddNavbarItem = async () => {
    if (!newItem.label || !newItem.href) return;
    setAddingItem(true);
    const maxOrder = navbarItems.reduce((m, i) => Math.max(m, i.sort_order), 0);
    const res = await createNavbarItem({
      label: newItem.label,
      href: newItem.href,
      sort_order: maxOrder + 1,
      badge_text: newItem.badge_text || null,
      badge_color: '#C9A84C',
      is_active: true,
    });
    if (res.success && res.data) {
      setNavbarItems(prev => [...prev, res.data!]);
      setNewItem({ label: '', href: '', badge_text: '' });
    }
    setAddingItem(false);
  };

  const handleToggleNavItem = async (id: string, is_active: boolean) => {
    await updateNavbarItem(id, { is_active });
    setNavbarItems(prev => prev.map(i => i.id === id ? { ...i, is_active } : i));
  };

  const handleDeleteNavItem = async (id: string) => {
    await deleteNavbarItem(id);
    setNavbarItems(prev => prev.filter(i => i.id !== id));
  };

  const handleNavLabelEdit = async (id: string, label: string) => {
    await updateNavbarItem(id, { label });
    setNavbarItems(prev => prev.map(i => i.id === id ? { ...i, label } : i));
  };

  const handleNavHrefEdit = async (id: string, href: string) => {
    await updateNavbarItem(id, { href });
    setNavbarItems(prev => prev.map(i => i.id === id ? { ...i, href } : i));
  };

  if (!settings) {
    return (
      <div className="p-8 text-center text-[var(--color-slate)]">
        Failed to load settings. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            Store Settings &amp; Navigation
          </h1>
          <AdminSectionInfo
            title="Global Store Configuration"
            purpose="Configure global store identity (Brand name, Tagline, Logo, Favicon), announcement bar ribbons, contact numbers, currency symbol, and the dynamic storefront Navbar menu builder."
            storefrontImpact="Changes propagate live to the Storefront Header, Top Announcement Bar, Footer contact info, and SEO meta tags across every single page."
            targets={[
              { name: 'Storefront Header & Logo', path: '/', description: 'Brand name, logo, and active navbar links' },
              { name: 'Storefront Footer', path: '/', description: 'Contact emails, phone, and WhatsApp numbers' },
              { name: 'Announcement Bar', path: '/', description: 'Top promotional ribbon' },
            ]}
          />
        </div>
        <p className="text-sm text-[var(--color-slate)]">Manage your store branding, content, and configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-[var(--color-gold)] shadow-sm border border-[var(--color-whisper)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >

          {/* BRANDING TAB */}
          {activeTab === 'branding' && (
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">Brand Identity</h2>
                <SaveStatus status={saveStatus.branding} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Site Name</label>
                  <input
                    className={inputClass}
                    value={settings.site_name}
                    onChange={e => setSettings(s => s ? { ...s, site_name: e.target.value } : s)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tagline</label>
                  <input
                    className={inputClass}
                    value={settings.site_tagline || ''}
                    onChange={e => setSettings(s => s ? { ...s, site_tagline: e.target.value } : s)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Logo URL</label>
                  <input
                    className={inputClass}
                    placeholder="https://..."
                    value={settings.logo_url || ''}
                    onChange={e => setSettings(s => s ? { ...s, logo_url: e.target.value } : s)}
                  />
                  {settings.logo_url && (
                    <div className="mt-3 p-3 border border-[var(--color-whisper)] rounded-lg inline-block">
                      <img src={settings.logo_url} alt="Logo preview" className="h-12 object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Favicon URL</label>
                  <input
                    className={inputClass}
                    placeholder="https://..."
                    value={settings.favicon_url || ''}
                    onChange={e => setSettings(s => s ? { ...s, favicon_url: e.target.value } : s)}
                  />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--color-whisper)] flex justify-end">
                <button
                  onClick={() => handleSave('branding', {
                    site_name: settings.site_name,
                    site_tagline: settings.site_tagline,
                    logo_url: settings.logo_url,
                    favicon_url: settings.favicon_url,
                  })}
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  Save Branding
                </button>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENT TAB */}
          {activeTab === 'announcement' && (
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">Announcement Bar</h2>
                <SaveStatus status={saveStatus.announcement} />
              </div>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSettings(s => s ? { ...s, announcement_bar_enabled: !s.announcement_bar_enabled } : s)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.announcement_bar_enabled ? 'bg-[var(--color-gold)]' : 'bg-gray-200'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${settings.announcement_bar_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    {settings.announcement_bar_enabled ? 'Announcement bar is visible' : 'Announcement bar is hidden'}
                  </span>
                </div>

                {settings.announcement_bar_enabled && (
                  <>
                    {/* Live preview */}
                    <div
                      className="rounded-lg p-3 text-center text-sm font-medium transition-all"
                      style={{
                        backgroundColor: settings.announcement_bar_bg_color,
                        color: settings.announcement_bar_text_color,
                      }}
                    >
                      {settings.announcement_bar_text || 'Your announcement text here…'}
                      {settings.announcement_bar_link && (
                        <span className="ml-2 underline">Learn more →</span>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Message Text</label>
                      <input
                        className={inputClass}
                        value={settings.announcement_bar_text}
                        onChange={e => setSettings(s => s ? { ...s, announcement_bar_text: e.target.value } : s)}
                        placeholder="Free shipping on orders above ₹999 🎉"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Link URL (optional)</label>
                      <input
                        className={inputClass}
                        value={settings.announcement_bar_link}
                        onChange={e => setSettings(s => s ? { ...s, announcement_bar_link: e.target.value } : s)}
                        placeholder="/sale"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Background Color</label>
                        <div className="flex gap-2 flex-wrap">
                          {['#C9A84C', '#1a1a1a', '#16a34a', '#dc2626', '#7c3aed', '#0284c7'].map(c => (
                            <button
                              key={c}
                              onClick={() => setSettings(s => s ? { ...s, announcement_bar_bg_color: c } : s)}
                              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.announcement_bar_bg_color === c ? 'border-[var(--color-ink)] scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <input
                            type="color"
                            value={settings.announcement_bar_bg_color}
                            onChange={e => setSettings(s => s ? { ...s, announcement_bar_bg_color: e.target.value } : s)}
                            className="w-8 h-8 rounded-full cursor-pointer border-2 border-[var(--color-whisper)]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Text Color</label>
                        <div className="flex gap-2">
                          {['#F3EEE8', '#1a1a1a'].map(c => (
                            <button
                              key={c}
                              onClick={() => setSettings(s => s ? { ...s, announcement_bar_text_color: c } : s)}
                              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.announcement_bar_text_color === c ? 'border-[var(--color-gold)] scale-110' : 'border-[var(--color-whisper)]'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--color-whisper)] flex justify-end">
                <button
                  onClick={() => handleSave('announcement', {
                    announcement_bar_enabled: settings.announcement_bar_enabled,
                    announcement_bar_text: settings.announcement_bar_text,
                    announcement_bar_link: settings.announcement_bar_link,
                    announcement_bar_bg_color: settings.announcement_bar_bg_color,
                    announcement_bar_text_color: settings.announcement_bar_text_color,
                  })}
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  Save Announcement
                </button>
              </div>
            </div>
          )}

          {/* CONTACT & SOCIAL TAB */}
          {activeTab === 'contact' && (
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">Contact & Social</h2>
                <SaveStatus status={saveStatus.contact} />
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Email</label>
                      <input className={inputClass} type="email" value={settings.contact_email}
                        onChange={e => setSettings(s => s ? { ...s, contact_email: e.target.value } : s)} />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input className={inputClass} value={settings.contact_phone}
                        onChange={e => setSettings(s => s ? { ...s, contact_phone: e.target.value } : s)} />
                    </div>
                    <div>
                      <label className={labelClass}>WhatsApp Number</label>
                      <input className={inputClass} value={settings.contact_whatsapp}
                        onChange={e => setSettings(s => s ? { ...s, contact_whatsapp: e.target.value } : s)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Address</label>
                      <textarea className={inputClass + ' min-h-[80px] resize-none'} value={settings.address}
                        onChange={e => setSettings(s => s ? { ...s, address: e.target.value } : s)} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'social_instagram', label: 'Instagram URL' },
                      { key: 'social_facebook', label: 'Facebook URL' },
                      { key: 'social_whatsapp', label: 'WhatsApp URL' },
                      { key: 'social_youtube', label: 'YouTube URL' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className={labelClass}>{label}</label>
                        <input
                          className={inputClass}
                          placeholder="https://..."
                          value={(settings as any)[key] || ''}
                          onChange={e => setSettings(s => s ? { ...s, [key]: e.target.value } : s)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--color-whisper)] flex justify-end">
                <button
                  onClick={() => handleSave('contact', {
                    contact_email: settings.contact_email,
                    contact_phone: settings.contact_phone,
                    contact_whatsapp: settings.contact_whatsapp,
                    address: settings.address,
                    social_instagram: settings.social_instagram,
                    social_facebook: settings.social_facebook,
                    social_whatsapp: settings.social_whatsapp,
                    social_youtube: settings.social_youtube,
                  })}
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  Save Contact
                </button>
              </div>
            </div>
          )}

          {/* COMMERCE TAB */}
          {activeTab === 'commerce' && (
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">Commerce Settings</h2>
                <SaveStatus status={saveStatus.commerce} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Currency Code</label>
                  <select className={inputClass} value={settings.currency}
                    onChange={e => setSettings(s => s ? { ...s, currency: e.target.value } : s)}>
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Currency Symbol</label>
                  <input className={inputClass} value={settings.currency_symbol}
                    onChange={e => setSettings(s => s ? { ...s, currency_symbol: e.target.value } : s)} />
                </div>
                <div>
                  <label className={labelClass}>Free Shipping Above (₹)</label>
                  <input className={inputClass} type="number" value={settings.free_shipping_threshold}
                    onChange={e => setSettings(s => s ? { ...s, free_shipping_threshold: Number(e.target.value) } : s)} />
                </div>
                <div>
                  <label className={labelClass}>COD Max Amount (₹)</label>
                  <input className={inputClass} type="number" value={settings.cod_max_amount}
                    onChange={e => setSettings(s => s ? { ...s, cod_max_amount: Number(e.target.value) } : s)} />
                </div>
                <div>
                  <label className={labelClass}>Return Policy (Days)</label>
                  <input className={inputClass} type="number" value={settings.return_policy_days}
                    onChange={e => setSettings(s => s ? { ...s, return_policy_days: Number(e.target.value) } : s)} />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--color-whisper)] flex justify-end">
                <button
                  onClick={() => handleSave('commerce', {
                    currency: settings.currency,
                    currency_symbol: settings.currency_symbol,
                    free_shipping_threshold: settings.free_shipping_threshold,
                    cod_max_amount: settings.cod_max_amount,
                    return_policy_days: settings.return_policy_days,
                  })}
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  Save Commerce
                </button>
              </div>
            </div>
          )}

          {/* SEO TAB */}
          {activeTab === 'seo' && (
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">SEO Settings</h2>
                <SaveStatus status={saveStatus.seo} />
              </div>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Meta Title</label>
                  <input className={inputClass} value={settings.meta_title}
                    onChange={e => setSettings(s => s ? { ...s, meta_title: e.target.value } : s)} />
                  <p className={`mt-1 text-xs ${settings.meta_title.length > 60 ? 'text-amber-500' : 'text-[var(--color-mist)]'}`}>
                    {settings.meta_title.length}/60 characters (recommended: under 60)
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Meta Description</label>
                  <textarea
                    className={inputClass + ' min-h-[100px] resize-none'}
                    value={settings.meta_description}
                    onChange={e => setSettings(s => s ? { ...s, meta_description: e.target.value } : s)}
                    placeholder="Brief description for search engines…"
                  />
                  <p className={`mt-1 text-xs ${settings.meta_description.length > 160 ? 'text-amber-500' : 'text-[var(--color-mist)]'}`}>
                    {settings.meta_description.length}/160 characters (recommended: 120–160)
                  </p>
                </div>
                {/* Google Preview */}
                <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]">
                  <p className="text-xs text-[var(--color-slate)] uppercase tracking-wider mb-3">Google Preview</p>
                  <p className="text-[#1a0dab] text-base hover:underline cursor-pointer truncate">{settings.meta_title || 'Your Meta Title'}</p>
                  <p className="text-xs text-[#006621]">angelikafashions.com</p>
                  <p className="text-sm text-[#545454] mt-1 line-clamp-2">{settings.meta_description || 'Your meta description will appear here…'}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--color-whisper)] flex justify-end">
                <button
                  onClick={() => handleSave('seo', {
                    meta_title: settings.meta_title,
                    meta_description: settings.meta_description,
                  })}
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  Save SEO
                </button>
              </div>
            </div>
          )}

          {/* NAVBAR TAB */}
          {activeTab === 'navbar' && (
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-ink)]">Navbar Builder</h2>
                  <p className="text-sm text-[var(--color-slate)] mt-0.5">Manage navigation items. Changes reflect immediately on the store.</p>
                </div>
                <SaveStatus status={saveStatus.navbar} />
              </div>

              {/* Navbar items list */}
              <div className="space-y-2 mb-6">
                {navbarItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.is_active ? 'border-[var(--color-whisper)] bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'
                      }`}
                  >
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        className="text-sm px-2 py-1.5 border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-ink)] bg-white"
                        defaultValue={item.label}
                        onBlur={e => handleNavLabelEdit(item.id, e.target.value)}
                        placeholder="Label"
                      />
                      <input
                        className="text-sm px-2 py-1.5 border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-slate)] bg-white font-mono"
                        defaultValue={item.href}
                        onBlur={e => handleNavHrefEdit(item.id, e.target.value)}
                        placeholder="/path"
                      />
                    </div>
                    {item.badge_text && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white" style={{ backgroundColor: item.badge_color }}>
                        {item.badge_text}
                      </span>
                    )}
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-[var(--color-mist)] hover:text-[var(--color-slate)]">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleToggleNavItem(item.id, !item.is_active)}
                      className={`transition-colors ${item.is_active ? 'text-[var(--color-gold)]' : 'text-gray-300'}`}
                      title={item.is_active ? 'Hide from navbar' : 'Show in navbar'}
                    >
                      {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteNavItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Add new item */}
              <div className="border-t border-[var(--color-whisper)] pt-5">
                <p className="text-sm font-semibold text-[var(--color-ink)] mb-3">Add New Item</p>
                <div className="flex gap-2 flex-wrap">
                  <input
                    className={inputClass + ' flex-1 min-w-[120px]'}
                    placeholder="Label (e.g. Collections)"
                    value={newItem.label}
                    onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))}
                  />
                  <input
                    className={inputClass + ' flex-1 min-w-[120px] font-mono'}
                    placeholder="/path (e.g. /collections)"
                    value={newItem.href}
                    onChange={e => setNewItem(p => ({ ...p, href: e.target.value }))}
                  />
                  <input
                    className={inputClass + ' w-32'}
                    placeholder="Badge (e.g. NEW)"
                    value={newItem.badge_text}
                    onChange={e => setNewItem(p => ({ ...p, badge_text: e.target.value }))}
                  />
                  <button
                    onClick={handleAddNavbarItem}
                    disabled={addingItem || !newItem.label || !newItem.href}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {addingItem ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
