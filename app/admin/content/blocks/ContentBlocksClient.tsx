'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { ContentBlock, ContentBlockType, CONTENT_BLOCK_TYPES, CONTENT_BLOCK_DEFAULT_CONTENT, CONTENT_BLOCK_DEFAULT_SETTINGS } from '@/lib/actions/content-blocks-types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Edit, Trash2, Copy, Eye, EyeOff,
  GripVertical, ChevronDown, ChevronUp,
  Save, Layout, Type, Image,
  Palette, Settings, Zap, AlertCircle,
  CheckCircle, Loader2, X, Search,
  ArrowUp, ArrowDown, Menu,
  Code, Globe, Layers, Smartphone,
  Tablet, Monitor, Paintbrush, PlayCircle
} from 'lucide-react';

interface ContentBlocksClientProps {
  initialBlocks: ContentBlock[];
  error?: string;
}

// ============================================
// TYPE DEFINITIONS FOR UI
// ============================================

interface EditorState {
  isOpen: boolean;
  editingBlock: ContentBlock | null;
  formData: {
    key: string;
    type: ContentBlockType;
    title: string;
    content: any;
    settings: any;
    is_active: boolean;
    published_at: string | null;
  };
  activeTab: 'content' | 'settings' | 'preview';
  errors: Record<string, string>;
}

const initialFormData = {
  key: '',
  type: 'hero' as ContentBlockType,
  title: '',
  content: {},
  settings: {},
  is_active: false,
  published_at: null,
};

// ============================================
// SORTABLE BLOCK ITEM
// ============================================

interface SortableBlockItemProps {
  block: ContentBlock;
  index: number;
  dragHandleProps: any;
  onEdit: (block: ContentBlock) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (block: ContentBlock) => void;
}

function SortableBlockItem({ block, index, dragHandleProps, onEdit, onDuplicate, onDelete, onToggle }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeInfo = CONTENT_BLOCK_TYPES.find(t => t.value === block.type) || { label: block.type, description: '' };
  const statusColor = block.is_active
    ? (block.published_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')
    : 'bg-gray-100 text-gray-700';
  const statusText = block.is_active
    ? (block.published_at ? 'Published' : 'Active (Draft)')
    : 'Inactive';

  return (
    <div ref={setNodeRef} style={style} className="transition-all duration-200">
      <Card variant="default" padding="none" className={isDragging ? 'shadow-lg ring-2 ring-primary' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              {...dragHandleProps}
              className="flex-shrink-0 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Type Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layout className="w-6 h-6 text-primary" />
            </div>

            {/* Block Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-medium text-gray-900 truncate flex-1">{block.title || 'Untitled'}</h3>
                <Badge variant="outline" size="sm" className="text-xs">{typeInfo.label}</Badge>
                <Badge
                  variant={block.is_active ? 'success' : 'ghost'}
                  size="sm"
                  className={statusColor}
                >
                  {statusText}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 truncate">{block.key}</p>
              <p className="text-xs text-gray-400 mt-1">{typeInfo.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>Order: {block.sort_order ?? index}</span>
                <span>Updated: {new Date(block.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => onToggle(block)} title={block.is_active ? 'Unpublish' : 'Publish'}>
                {block.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(block)} title="Edit">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDuplicate(block.id)} title="Duplicate">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(block.id)} title="Delete" className="text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ContentBlocksClient({ initialBlocks, error: initialError }: ContentBlocksClientProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDrafts, setShowDrafts] = useState(true);
  const { addToast } = useToast();
  const [editor, setEditor] = useState<EditorState>({
    isOpen: false,
    editingBlock: null,
    formData: initialFormData,
    activeTab: 'content',
    errors: {},
  });

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync with initial blocks on mount
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  // ============================================
  // API HELPERS
  // ============================================

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const refreshBlocks = useCallback(async () => {
    try {
      const data = await apiCall(`/api/admin/content-blocks?includeDrafts=${showDrafts}`);
      setBlocks(data.blocks || []);
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to refresh blocks' });
    }
  }, [showDrafts, addToast]);

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const handleCreate = () => {
    setEditor({
      isOpen: true,
      editingBlock: null,
      formData: { ...initialFormData, type: 'hero', content: CONTENT_BLOCK_DEFAULT_CONTENT.hero, settings: CONTENT_BLOCK_DEFAULT_SETTINGS.hero },
      activeTab: 'content',
      errors: {},
    });
  };

  const handleEdit = (block: ContentBlock) => {
    setEditor({
      isOpen: true,
      editingBlock: block,
      formData: {
        key: block.key,
        type: block.type as ContentBlockType,
        title: block.title || '',
        content: block.content || CONTENT_BLOCK_DEFAULT_CONTENT[block.type as ContentBlockType] || {},
        settings: block.settings || CONTENT_BLOCK_DEFAULT_SETTINGS[block.type as ContentBlockType] || {},
        is_active: block.is_active,
        published_at: block.published_at,
      },
      activeTab: 'content',
      errors: {},
    });
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/admin/content-blocks/duplicate', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
      setBlocks(prev => [data.block, ...prev]);
      addToast({ type: 'success', title: 'Success', message: 'Content block duplicated' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content block?')) return;
    try {
      setLoading(true);
      await apiCall(`/api/admin/content-blocks/${id}`, { method: 'DELETE' });
      setBlocks(prev => prev.filter(b => b.id !== id));
      addToast({ type: 'success', title: 'Success', message: 'Content block deleted' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const { editingBlock, formData: rawFormData } = editor;
    // Type assertion to ensure formData has explicit properties
    const formData = rawFormData as EditorState['formData'];
    const isNew = !editingBlock;

    // Validate
    const errors: Record<string, string> = {};
    if (!formData['key'].trim()) errors['key'] = 'Key is required';
    if (!formData['type']) errors['type'] = 'Type is required';
    if (Object.keys(errors).length > 0) {
      setEditor(prev => ({ ...prev, errors }));
      return;
    }

    try {
      setLoading(true);
      const url = isNew ? '/api/admin/content-blocks' : `/api/admin/content-blocks/${editingBlock.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const data = await apiCall(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (isNew) {
        setBlocks(prev => [data.block, ...prev]);
      } else {
        setBlocks(prev => prev.map(b => b.id === editingBlock.id ? data.block : b));
      }

      setEditor(prev => ({ ...prev, isOpen: false }));
      addToast({ type: 'success', title: 'Success', message: isNew ? 'Content block created' : 'Content block updated' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (block: ContentBlock) => {
    try {
      const newStatus = !block.is_active;
      const data = await apiCall('/api/admin/content-blocks/toggle', {
        method: 'POST',
        body: JSON.stringify({ id: block.id, is_active: newStatus, publish: newStatus }),
      });
      setBlocks(prev => prev.map(b => b.id === block.id ? data.block : b));
      addToast({ type: 'success', title: 'Success', message: newStatus ? 'Published' : 'Unpublished' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message });
    }
  };

  // ============================================
  // DRAG & DROP REORDER
  // ============================================

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);

    const newBlocks = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(newBlocks);

    try {
      const blockIds = newBlocks.map(b => b.id);
      await apiCall('/api/admin/content-blocks/reorder', {
        method: 'POST',
        body: JSON.stringify({ blockIds }),
      });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to save order' });
      refreshBlocks();
    }
  };

  // ============================================
  // FORM HANDLERS
  // ============================================

  // Helper to update formData without index signature widening
  const updateFormData = (updates: Partial<EditorState['formData']>) => {
    setEditor(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates } as EditorState['formData'],
    }));
  };

  const handleFormChange = (field: string, value: any) => {
    updateFormData({ [field]: value } as Partial<EditorState['formData']>);
    setEditor(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: '' },
    }));
  };

  const handleContentChange = (key: string, value: any) => {
    updateFormData({ content: { ...editor.formData.content, [key]: value } });
  };

  const handleSettingsChange = (key: string, value: any) => {
    updateFormData({ settings: { ...editor.formData.settings, [key]: value } });
  };

  const handleTypeChange = (type: ContentBlockType) => {
    setEditor(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        type,
        content: CONTENT_BLOCK_DEFAULT_CONTENT[type] || {},
        settings: CONTENT_BLOCK_DEFAULT_SETTINGS[type] || {},
      },
    }));
  };

  // ============================================
  // FILTERED BLOCKS
  // ============================================

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = block.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (block.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = typeFilter === 'all' || block.type === typeFilter;
    const matchesDraft = showDrafts || block.is_active;
    return matchesSearch && matchesType && matchesDraft;
  });

  // ============================================
  // RENDER
  // ============================================

  if (initialError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          {initialError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900">Content Blocks</h1>
          <p className="text-gray-500 mt-1">Manage homepage sections, banners, and dynamic content</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Content Block
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
            fullWidth
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter} fullWidth>
            <SelectTrigger placeholder="All Types" className="w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CONTENT_BLOCK_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showDrafts}
              onChange={e => setShowDrafts(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Show Drafts
          </label>
        </div>
      </div>

      {/* Blocks List with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredBlocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {filteredBlocks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Layout className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">{searchQuery || typeFilter !== 'all' ? 'No blocks match your filters' : 'No content blocks yet'}</p>
                <p className="text-sm mt-1">Click "Add Content Block" to create your first block</p>
              </div>
            ) : (
              filteredBlocks.map((block, index) => (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  index={index}
                  dragHandleProps={{}}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onToggle={handleToggleStatus}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Editor Modal */}
      <AnimatePresence>
        {editor.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setEditor(prev => ({ ...prev, isOpen: false }))}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold">
                  {editor.editingBlock ? 'Edit Content Block' : 'Create Content Block'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setEditor(prev => ({ ...prev, isOpen: false }))}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex border-b bg-gray-50 px-4">
                {['content', 'settings', 'preview'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setEditor(prev => ({ ...prev, activeTab: tab as any }))}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      editor.activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {editor.activeTab === 'content' && (
                  <ContentTab
                    formData={editor.formData}
                    errors={editor.errors}
                    onChange={handleFormChange}
                    onContentChange={handleContentChange}
                    onTypeChange={handleTypeChange}
                  />
                )}
                {editor.activeTab === 'settings' && (
                  <SettingsTab
                    formData={editor.formData}
                    onChange={handleSettingsChange}
                  />
                )}
                {editor.activeTab === 'preview' && (
                  <PreviewTab block={editor.formData} />
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                <Button variant="outline" onClick={() => setEditor(prev => ({ ...prev, isOpen: false }))}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button onClick={handleSave} loading={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {editor.editingBlock ? 'Save Changes' : 'Create Block'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// CONTENT TAB
// ============================================

function ContentTab({
  formData,
  errors,
  onChange,
  onContentChange,
  onTypeChange,
}: {
  formData: EditorState['formData'];
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  onContentChange: (key: string, value: any) => void;
  onTypeChange: (type: ContentBlockType) => void;
}) {
  const defaults = CONTENT_BLOCK_DEFAULT_CONTENT[formData.type] || {};

  return (
    <div className="space-y-6">
      {/* Key & Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Key *"
          value={formData['key']}
          onChange={e => onChange('key', e.target.value)}
          placeholder="hero-banner, featured-collection, etc."
          error={errors['key']}
          disabled={!!formData['key']}
          fullWidth
        />
        <Select value={formData['type']} onValueChange={e => onTypeChange(e as ContentBlockType)} fullWidth>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_BLOCK_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        label="Title"
        value={formData.title}
        onChange={e => onChange('title', e.target.value)}
        placeholder="Optional display title"
        fullWidth
      />

      {/* Dynamic Content Fields based on Type */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Content</h4>
        {renderContentFields(formData.type, formData.content, onContentChange, defaults)}
      </div>
    </div>
  );
}

function renderContentFields(
  type: ContentBlockType,
  content: any,
  onChange: (key: string, value: any) => void,
  defaults: any
) {
  const fields: Record<ContentBlockType, { key: string; label: string; type: 'text' | 'textarea' | 'url' | 'number' | 'select' | 'color' | 'checkbox' | 'image'; options?: { value: string; label: string }[] }[]> = {
    hero: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'subheadline', label: 'Subheadline', type: 'text' },
      { key: 'cta_text', label: 'CTA Text', type: 'text' },
      { key: 'cta_link', label: 'CTA Link', type: 'url' },
      { key: 'background_image', label: 'Background Image URL', type: 'url' },
      { key: 'overlay_opacity', label: 'Overlay Opacity', type: 'number' },
    ],
    banner: [
      { key: 'text', label: 'Banner Text', type: 'text' },
      { key: 'link_text', label: 'Link Text', type: 'text' },
      { key: 'link_url', label: 'Link URL', type: 'url' },
      { key: 'background_color', label: 'Background Color', type: 'color' },
      { key: 'text_color', label: 'Text Color', type: 'color' },
    ],
    featured_collection: [
      { key: 'collection_id', label: 'Collection ID', type: 'text' },
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'product_limit', label: 'Product Limit', type: 'number' },
      { key: 'view_all_link', label: 'View All Link', type: 'url' },
    ],
    category_grid: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'columns', label: 'Columns', type: 'number' },
    ],
    text_block: [
      { key: 'content', label: 'HTML Content', type: 'textarea' },
      { key: 'alignment', label: 'Alignment', type: 'select', options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ]},
    ],
    image_gallery: [
      { key: 'layout', label: 'Layout', type: 'select', options: [
        { value: 'grid', label: 'Grid' },
        { value: 'carousel', label: 'Carousel' },
        { value: 'masonry', label: 'Masonry' },
      ]},
      { key: 'columns', label: 'Columns', type: 'number' },
      { key: 'gap', label: 'Gap', type: 'select', options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ]},
    ],
    testimonial: [
      { key: 'autoplay', label: 'Autoplay', type: 'checkbox' },
      { key: 'interval', label: 'Interval (ms)', type: 'number' },
    ],
    newsletter: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'subheadline', label: 'Subheadline', type: 'text' },
      { key: 'placeholder', label: 'Input Placeholder', type: 'text' },
      { key: 'button_text', label: 'Button Text', type: 'text' },
      { key: 'background_image', label: 'Background Image URL', type: 'url' },
    ],
    instagram_feed: [
      { key: 'username', label: 'Instagram Username', type: 'text' },
      { key: 'post_limit', label: 'Post Limit', type: 'number' },
      { key: 'title', label: 'Section Title', type: 'text' },
    ],
    video_banner: [
      { key: 'video_url', label: 'Video URL', type: 'url' },
      { key: 'poster_image', label: 'Poster Image URL', type: 'url' },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'subheadline', label: 'Subheadline', type: 'text' },
      { key: 'cta_text', label: 'CTA Text', type: 'text' },
      { key: 'cta_link', label: 'CTA Link', type: 'url' },
      { key: 'muted', label: 'Muted', type: 'checkbox' },
      { key: 'loop', label: 'Loop', type: 'checkbox' },
    ],
    split_layout: [
      { key: 'reverse_on_mobile', label: 'Reverse on Mobile', type: 'checkbox' },
    ],
    stats_bar: [],
  };

  const typeFields = fields[type] || [];

  if (typeFields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No specific content fields for this block type.</p>
        <p className="text-sm mt-1">Configure in Settings tab or use JSON editor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {typeFields.map(field => (
        <div key={field.key} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label} {field.key === 'headline' || field.key === 'title' ? <span className="text-red-500">*</span> : null}
          </label>
          {field.type === 'textarea' ? (
            <Textarea
              value={content[field.key] || defaults[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
              rows={4}
              className="font-mono text-sm"
              fullWidth
            />
          ) : field.type === 'select' ? (
            <Select value={content[field.key] || defaults[field.key] || ''} onValueChange={e => onChange(field.key, e)} fullWidth>
              <SelectTrigger>
                <SelectValue placeholder={field.label} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'checkbox' ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={content[field.key] ?? defaults[field.key] ?? false}
                onChange={e => onChange(field.key, e.target.checked)}
              />
              <span className="text-sm">{field.label}</span>
            </label>
          ) : (
            <Input
              type={field.type}
              value={content[field.key] ?? defaults[field.key] ?? ''}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.label}
              fullWidth
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// SETTINGS TAB
// ============================================

function SettingsTab({
  formData,
  onChange,
}: {
  formData: EditorState['formData'];
  onChange: (key: string, value: any) => void;
}) {
  const defaults = CONTENT_BLOCK_DEFAULT_SETTINGS[formData.type] || {};

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
        <Switch
          checked={formData.is_active}
          onChange={checked => onChange('is_active', checked)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Published At</label>
        <Input
          type="datetime-local"
          value={formData.published_at ? formData.published_at.slice(0, 16) : ''}
          onChange={e => onChange('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
          fullWidth
        />
        <p className="text-xs text-gray-500 mt-1">Leave empty to publish immediately when activated</p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Block Settings</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">Settings JSON (advanced)</p>
          <Textarea
            value={JSON.stringify(formData.settings, null, 2)}
            onChange={e => {
              try {
                onChange('settings', JSON.parse(e.target.value));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            rows={10}
            className="font-mono text-xs"
            placeholder="{}"
            fullWidth
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Responsive Preview</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Smartphone className="w-4 h-4" /> Mobile
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Tablet className="w-4 h-4" /> Tablet
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Monitor className="w-4 h-4" /> Desktop
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PREVIEW TAB
// ============================================

function PreviewTab({ block }: { block: EditorState['formData'] }) {
  const typeInfo = CONTENT_BLOCK_TYPES.find(t => t.value === block.type);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" size="sm">{typeInfo?.label || block.type}</Badge>
          <span className="text-sm text-gray-500">Key: {block.key}</span>
        </div>
        <div className="border rounded-lg p-6 bg-white min-h-[200px]">
          <ContentBlockPreview type={block.type} content={block.content} settings={block.settings} />
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium mb-2">Raw Content JSON</h5>
        <pre className="text-xs overflow-auto bg-white p-3 rounded border">
          {JSON.stringify(block.content, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ============================================
// CONTENT BLOCK PREVIEW COMPONENTS
// ============================================

function ContentBlockPreview({ type, content, settings }: { type: string; content: any; settings: any }) {
  const c = content || {};
  const s = settings || {};

  switch (type) {
    case 'hero':
      return (
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white">
          <div className="text-center p-4">
            <h2 className="text-2xl font-bold mb-2">{c.headline || 'Headline'}</h2>
            <p className="text-gray-300 mb-4">{c.subheadline || 'Subheadline'}</p>
            <button className="px-6 py-2 bg-white text-gray-900 rounded-lg font-medium">
              {c.cta_text || 'CTA'}
            </button>
          </div>
        </div>
      );

    case 'banner':
      return (
        <div className="h-20 bg-gray-800 rounded-lg flex items-center justify-center text-white px-6">
          <div className="flex items-center justify-between w-full max-w-4xl">
            <span>{c.text || 'Banner text'}</span>
            <button className="px-4 py-2 bg-white text-gray-900 rounded text-sm">
              {c.link_text || 'Link'}
            </button>
          </div>
        </div>
      );

    case 'featured_collection':
      return (
        <div>
          <h3 className="font-semibold mb-3">{c.title || 'Featured Collection'}</h3>
          <p className="text-gray-500 text-sm mb-4">{c.subtitle || 'Subtitle'}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg aspect-[4/5] flex items-center justify-center text-gray-400">
                Product {i}
              </div>
            ))}
          </div>
        </div>
      );

    case 'category_grid': {
      const categories = ['Women', 'Men', 'Kids', 'Accessories'];
      return (
        <div>
          <h3 className="font-semibold mb-3">{c.title || 'Categories'}</h3>
          <p className="text-gray-500 text-sm mb-4">{c.subtitle || 'Subtitle'}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <div key={i} className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-gray-600">
                {cat}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'text_block':
      return (
        <div className="prose max-w-none text-gray-700">
          <div dangerouslySetInnerHTML={{ __html: c.content || '<p>Content here...</p>' }} />
        </div>
      );

    case 'image_gallery': {
      const images = [1, 2, 3, 4, 5, 6];
      return (
        <div className="grid grid-cols-3 gap-2">
          {images.map(i => (
            <div key={i} className="bg-gray-100 rounded aspect-[4/5] flex items-center justify-center text-gray-400">
              Image {i}
            </div>
          ))}
        </div>
      );
    }

    case 'testimonial':
      return (
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl italic text-gray-700 mb-4">"{c.testimonials?.[0]?.quote || 'Amazing product! Highly recommended.'}"</p>
          <p className="font-medium">{c.testimonials?.[0]?.author || 'Customer Name'}</p>
          <p className="text-sm text-gray-500">{c.testimonials?.[0]?.role || 'Verified Buyer'}</p>
        </div>
      );

    case 'newsletter':
      return (
        <div className="bg-gray-800 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">{c.headline || 'Join Our Community'}</h3>
          <p className="text-gray-300 mb-4">{c.subheadline || 'Get 10% off your first order'}</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input type="email" placeholder={c.placeholder || 'Enter your email'} className="flex-1 px-4 py-2 rounded-l-lg" />
            <button className="px-6 py-2 bg-primary text-white rounded-r-lg font-medium">
              {c.button_text || 'Subscribe'}
            </button>
          </div>
        </div>
      );

    case 'instagram_feed': {
      const posts = [1, 2, 3, 4, 5, 6];
      return (
        <div>
          <h3 className="font-semibold mb-3">{c.title || '@instagram'}</h3>
          <div className="grid grid-cols-3 gap-2">
            {posts.map(i => (
              <div key={i} className="bg-gray-100 rounded aspect-square flex items-center justify-center text-gray-400">
                Post {i}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'video_banner':
      return (
        <div className="relative h-48 bg-gray-900 rounded-lg flex items-center justify-center text-white">
          <div className="text-center">
            <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <p className="text-gray-400">Video Banner Preview</p>
            <p className="text-sm text-gray-500 mt-1">{c.video_url || 'No video URL'}</p>
          </div>
        </div>
      );

    case 'split_layout':
      return (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center text-gray-400">
            Left: Image
          </div>
          <div className="flex flex-col justify-center p-6">
            <h3 className="text-xl font-bold mb-2">{c.right_content?.title || 'Title'}</h3>
            <p className="text-gray-600 mb-4">{c.right_content?.description || 'Description'}</p>
            <button className="w-fit px-6 py-2 bg-primary text-white rounded-lg">
              {c.right_content?.cta_text || 'CTA'}
            </button>
          </div>
        </div>
      );

    case 'stats_bar':
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {(c.stats || []).map((stat: any, i: number) => (
            <div key={i} className="py-4">
              <div className="text-3xl font-bold text-gray-900">{stat.value || '0'}</div>
              <div className="text-sm text-gray-500">{stat.label || 'Label'}</div>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="text-center text-gray-500 py-8">
          Preview not available for {type}
        </div>
      );
  }
}