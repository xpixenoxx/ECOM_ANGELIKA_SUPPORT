'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Icon } from '@/components/ui/Icon';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail_url?: string | null;
  images: string[];
}

interface Hotspot {
  id?: string;
  product_id: string;
  x_percent: number;
  y_percent: number;
  display_order: number;
  product?: Product;
}

function DraggableHotspotPin({
  hotspot,
  index,
  imageRef,
  onDrag,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  hotspot: Hotspot;
  index: number;
  imageRef: React.RefObject<HTMLDivElement>;
  onDrag: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const [position, setPosition] = useState({ x: hotspot.x_percent, y: hotspot.y_percent });
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const pinRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPosition({ x: hotspot.x_percent, y: hotspot.y_percent });
  }, [hotspot.x_percent, hotspot.y_percent]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPin(true);
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDraggingPin) return;

    const move = (e: MouseEvent) => {
      if (!pinRef.current || !imageRef.current) return;
      const imageRect = imageRef.current.getBoundingClientRect();
      const pinRect = pinRef.current.getBoundingClientRect();
      const xPercent = ((pinRect.left + pinRect.width / 2 - imageRect.left) / imageRect.width) * 100;
      const yPercent = ((pinRect.top + pinRect.height / 2 - imageRect.top) / imageRect.height) * 100;
      setPosition({ x: Math.max(0, Math.min(100, xPercent)), y: Math.max(0, Math.min(100, yPercent)) });
    };

    const up = () => {
      setIsDraggingPin(false);
      document.body.style.userSelect = '';
      if (hotspot.id) onDrag(hotspot.id, position.x, position.y);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [isDraggingPin, hotspot.id, position, onDrag, imageRef]);

  return (
    <button
      ref={pinRef}
      className={`absolute z-10 w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${
        isDraggingPin ? 'scale-125 shadow-xl' : isDragging ? 'scale-110 ring-2 ring-amber-500' : ''
      }`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onMouseDown={handleMouseDown}
      onDragStart={(e) => hotspot.id && onDragStart(e, hotspot.id)}
      onDragEnd={onDragEnd}
      draggable={true}
      aria-label={`Hotspot ${index}: ${hotspot.product?.name}`}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full border-2 border-amber-600/60 animate-ping opacity-75" />
        <div className="relative w-full h-full rounded-full bg-amber-600 border-3 border-white shadow-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">{index}</span>
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded whitespace-nowrap shadow-lg">
          {hotspot.product?.name}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); if (hotspot.id) onDelete(hotspot.id); }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Delete hotspot"
        >
          <Icon name="x" className="w-3 h-3" />
        </button>
      </div>
    </button>
  );
}

export default function LookNewPage() {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();

  const [look, setLook] = useState<{
    name: string;
    lifestyle_image_url: string;
    lifestyle_image_alt: string;
    is_active: boolean;
    display_order: number;
  }>({
    name: '',
    lifestyle_image_url: '',
    lifestyle_image_alt: '',
    is_active: true,
    display_order: 0,
  });
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'hotspots'>('details');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [draggingHotspotId, setDraggingHotspotId] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, thumbnail_url, images')
          .eq('is_active', true)
          .order('name');
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error(error);
        addToast({ title: 'Error', message: 'Failed to load products', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [supabase, addToast]);

  // Handle image click to add hotspot
  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedProductId) {
        addToast({ title: 'Select a product first', message: 'Choose a product from the dropdown', type: 'warning' });
        return;
      }
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      const newHotspot: Hotspot = {
        id: `temp-${Date.now()}`,
        product_id: selectedProductId,
        x_percent: Math.round(xPercent * 100) / 100,
        y_percent: Math.round(yPercent * 100) / 100,
        display_order: hotspots.length,
        product: products.find((p) => p.id === selectedProductId),
      };

      setHotspots((prev) => [...prev, newHotspot]);
      setSelectedProductId('');
    },
    [selectedProductId, hotspots.length, products, addToast]
  );

  // Drag handlers for reordering list
  const handleDragStart = (e: React.DragEvent, hotspotId: string) => {
    setDraggingHotspotId(hotspotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, hotspotId: string) => {
      e.preventDefault();
      if (!draggingHotspotId || draggingHotspotId === hotspotId) return;

      setHotspots((prev) => {
        const newHotspots = [...prev];
        const fromIndex = newHotspots.findIndex((h) => h.id === draggingHotspotId);
        const toIndex = newHotspots.findIndex((h) => h.id === hotspotId);
        if (fromIndex === -1 || toIndex === -1) return prev;

        const [removed] = newHotspots.splice(fromIndex, 1);
        if (!removed) return prev;
        newHotspots.splice(toIndex, 0, removed);
        return newHotspots.map((h, i) => ({ ...h, display_order: i }));
      });
      setDraggingHotspotId(null);
    },
    [draggingHotspotId]
  );

  const handleDragEnd = () => setDraggingHotspotId(null);

  // Update hotspot position from pin drag
  const handlePinDrag = useCallback(
    (hotspotId: string, xPercent: number, yPercent: number) => {
      setHotspots((prev) =>
        prev.map((h) =>
          h.id === hotspotId ? { ...h, x_percent: Math.max(0, Math.min(100, xPercent)), y_percent: Math.max(0, Math.min(100, yPercent)) } : h
        )
      );
    },
    []
  );

  // Delete hotspot
  const deleteHotspot = useCallback((hotspotId: string) => {
    setHotspots((prev) => prev.filter((h) => h.id !== hotspotId).map((h, i) => ({ ...h, display_order: i })));
  }, []);

  // Save new look
  const handleSave = async () => {
    if (!look.name || !look.lifestyle_image_url) {
      addToast({ title: 'Missing fields', message: 'Name and image URL are required', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const { data: newLook, error: lookError } = await supabase
        .from('looks')
        .insert({
          name: look.name,
          lifestyle_image_url: look.lifestyle_image_url,
          lifestyle_image_alt: look.lifestyle_image_alt,
          is_active: look.is_active,
          display_order: look.display_order,
        })
        .select('id')
        .single();

      if (lookError) throw lookError;
      if (!newLook) throw new Error('Failed to create look');

      const validHotspots = hotspots.filter((h) => !h.id?.toString().startsWith('temp-'));
      if (validHotspots.length > 0) {
        const { error: hotspotError } = await supabase.from('look_hotspots').insert(
          validHotspots.map((h, i) => ({
            look_id: newLook.id,
            product_id: h.product_id,
            x_percent: h.x_percent,
            y_percent: h.y_percent,
            display_order: i,
          }))
        );
        if (hotspotError) throw hotspotError;
      }

      addToast({ title: 'Created', message: 'Look created successfully', type: 'success' });
      router.push('/admin/looks');
    } catch (error) {
      console.error(error);
      addToast({ title: 'Error', message: 'Failed to create look', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-40 bg-gray-200 rounded-xl"></div>
              <div className="h-40 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">Create New Look</h1>
              <p className="text-gray-500 text-sm mt-0.5">Build a shoppable lifestyle image</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/admin/looks')}>
                <Icon name="arrow-left" className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleSave} disabled={saving} className="ml-2">
                {saving ? 'Creating...' : 'Create Look'}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'details' | 'hotspots')}>
            <TabsList className="w-full max-w-2xl mx-auto mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="hotspots">Hotspots ({hotspots.length})</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="max-w-2xl mx-auto space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Look Name *</Label>
                    <Input
                      id="name"
                      value={look.name}
                      onChange={(e) => setLook({ ...look, name: e.target.value })}
                      placeholder="e.g., Summer Wedding Edit"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lifestyle_image_url">Lifestyle Image URL *</Label>
                    <Input
                      id="lifestyle_image_url"
                      value={look.lifestyle_image_url}
                      onChange={(e) => setLook({ ...look, lifestyle_image_url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lifestyle_image_alt">Alt Text</Label>
                    <Input
                      id="lifestyle_image_alt"
                      value={look.lifestyle_image_alt}
                      onChange={(e) => setLook({ ...look, lifestyle_image_alt: e.target.value })}
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_order">Display Order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={look.display_order}
                        onChange={(e) => setLook({ ...look, display_order: Number(e.target.value) })}
                        min={0}
                      />
                    </div>
                    <div className="flex items-end">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={look.is_active}
                          onChange={(e) => setLook({ ...look, is_active: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Active (visible on homepage)</span>
                      </Label>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Image Preview */}
              {look.lifestyle_image_url && (
                <Card className="p-0 overflow-hidden">
                  <div className="relative aspect-[16/9] bg-gray-100">
                    <Image
                      src={look.lifestyle_image_url}
                      alt={look.lifestyle_image_alt || look.name || 'Look preview'}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Hotspots Tab */}
            <TabsContent value="hotspots" className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Image with hotspots */}
                <div className="lg:col-span-2">
                  <Card className="p-0 overflow-hidden">
                    <div className="relative aspect-[16/9] bg-gray-100">
                      {look.lifestyle_image_url ? (
                        <>
                          <div ref={imageRef} className="relative aspect-[16/9] bg-gray-100">
                            <Image
                              ref={imageElementRef}
                              src={look.lifestyle_image_url}
                              alt={look.lifestyle_image_alt || look.name || 'Look preview'}
                              fill
                              className="object-cover"
                            />

                            {/* Hotspot pins */}
                            <div className="absolute inset-0" onClick={handleImageClick}>
                              {hotspots.map((hotspot, index) => (
                                <DraggableHotspotPin
                                  key={hotspot.id}
                                  hotspot={hotspot}
                                  index={index + 1}
                                  imageRef={imageRef}
                                  onDrag={handlePinDrag}
                                  onDelete={deleteHotspot}
                                  onDragStart={handleDragStart}
                                  onDragEnd={handleDragEnd}
                                  isDragging={draggingHotspotId === hotspot.id}
                                />
                              ))}
                            </div>

                            {/* Add hotspot hint */}
                            {!selectedProductId && hotspots.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-dashed border-gray-300 max-w-md mx-4">
                                  <Icon name="mouse-pointer-click" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                  <p className="text-gray-600">Select a product from the right panel, then click on the image to place a hotspot</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <p>Add an image URL in the Details tab to start placing hotspots</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right: Controls */}
                <div className="space-y-4">
                  {/* Product selector */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Add Hotspot</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="product-select">Select Product</Label>
                        <Select
                          value={selectedProductId}
                          onValueChange={setSelectedProductId}
                        >
                          <SelectTrigger id="product-select" placeholder="Choose a product...">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} — ₹{p.price.toLocaleString('en-IN')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedProductId && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {(() => {
                              const product = products.find((p) => p.id === selectedProductId);
                              return product?.thumbnail_url ? (
                                <Image src={product.thumbnail_url} alt={product.name} fill className="object-cover" sizes="48px" />
                              ) : null;
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{products.find((p) => p.id === selectedProductId)?.name}</p>
                            <p className="text-sm text-gray-500">₹{products.find((p) => p.id === selectedProductId)?.price.toLocaleString('en-IN')}</p>
                          </div>
                          <Button variant="ghost" size="sm" iconLeft={<Icon name="x" className="w-4 h-4" />} onClick={() => setSelectedProductId('')}>
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 text-center">
                        Then click on the image to place the hotspot
                      </p>
                    </div>
                  </Card>

                  {/* Existing hotspots list */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Existing Hotspots</h3>
                    {hotspots.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No hotspots yet</p>
                    ) : (
                      <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {hotspots.map((hotspot, index) => (
                          <li
                            key={hotspot.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            draggable
                            onDragStart={(e) => handleDragStart(e, hotspot.id!)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, hotspot.id!)}
                            onDragEnd={handleDragEnd}
                          >
                            <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{hotspot.product?.name || 'Unknown product'}</p>
                              <p className="text-xs text-gray-500">
                                ({hotspot.x_percent.toFixed(1)}%, {hotspot.y_percent.toFixed(1)}%)
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              iconLeft={<Icon name="trash" className="w-4 h-4" />}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                              onClick={() => deleteHotspot(hotspot.id!)}
                              aria-label="Delete hotspot"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ToastProvider>
  );
}