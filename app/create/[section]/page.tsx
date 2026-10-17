'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { parseCurrency, formatCurrency } from '@/lib/currency';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { ImageUploader, UploadedImageItem } from '@/components/uploads/ImageUploader';
import { CreateListingSchema } from '@/lib/validators/listing';
import {
  ChevronLeft,
  Layers,
  Package,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function CreateListingPage() {
  const params = useParams();
  const router = useRouter();
  const sectionParam = (params?.section as string) || 'map-art';

  // Normalize section
  const section: 'MAP_ART' | 'MARKET' | 'BUILD' =
    sectionParam === 'market'
      ? 'MARKET'
      : sectionParam === 'build'
      ? 'BUILD'
      : 'MAP_ART';

  const { addListing, currentUser } = useListings();

  // Common Form States
  const [kind, setKind] = useState<string>(
    section === 'MAP_ART' ? 'ARTWORK' : section === 'MARKET' ? 'SELL' : 'SERVICE'
  );
  const [title, setTitle] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Section Specific States: Map Art
  const [mapSize, setMapSize] = useState('2×2');
  const [stockOrSlots, setStockOrSlots] = useState(1);
  const [turnaroundDays, setTurnaroundDays] = useState(3);
  const [tagsInput, setTagsInput] = useState('Staircase, Shaded');

  // Section Specific States: Market
  const [category, setCategory] = useState<'Spawners' | 'Gear' | 'Resources' | 'Misc'>('Spawners');
  const [quantity, setQuantity] = useState(1);

  // Section Specific States: Build
  const [buildTypes, setBuildTypes] = useState<string[]>(['Base', 'Farm']);
  const [deadline, setDeadline] = useState('5 days');

  const parsedPrice = priceInput.trim() ? parseCurrency(priceInput) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate price
    let finalPrice: bigint | null = null;
    if (priceInput.trim()) {
      finalPrice = parseCurrency(priceInput);
      if (finalPrice === null) {
        setErrorMessage('Invalid in-game currency. Enter shorthand (e.g. 250k, 1.5m). Real money (USD/EUR) is forbidden.');
        return;
      }
    } else if (section !== 'BUILD') {
      setErrorMessage('Price is required for this section.');
      return;
    }

    // Assemble section details
    let details: Record<string, any> = {};
    if (section === 'MAP_ART') {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      details = {
        mapSize,
        copiesInStock: kind === 'ARTWORK' ? Number(stockOrSlots) : undefined,
        openSlots: kind === 'COMMISSION_OFFER' ? Number(stockOrSlots) : undefined,
        turnaroundDays: kind === 'COMMISSION_OFFER' ? Number(turnaroundDays) : undefined,
        tags,
      };
    } else if (section === 'MARKET') {
      details = {
        category,
        quantity: Number(quantity),
        unitPrice: finalPrice && quantity > 1 ? finalPrice / BigInt(quantity) : finalPrice,
      };
    } else if (section === 'BUILD') {
      details = {
        buildTypes,
        turnaroundDays: kind === 'SERVICE' ? Number(turnaroundDays) : undefined,
        deadline: kind === 'REQUEST' ? deadline : undefined,
      };
    }

    const payload = {
      section,
      kind: kind as any,
      title: title.trim(),
      description: description.trim(),
      price: finalPrice,
      isNegotiable,
      images: images.map((i) => i.url),
      details,
    };

    const result = CreateListingSchema.safeParse(payload);
    if (!result.success) {
      setErrorMessage(result.error.issues?.[0]?.message || 'Validation failed. Please review your input.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = addListing(result.data);
      const targetUrl =
        section === 'MAP_ART'
          ? `/map-art/${created.id}`
          : section === 'MARKET'
          ? `/market/${created.id}`
          : `/build/${created.id}`;
      router.push(targetUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create listing');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="border-b border-[var(--border)] pb-4 flex items-center justify-between">
          <Link
            href={section === 'MAP_ART' ? '/map-art' : section === 'MARKET' ? '/market' : '/build'}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to {section === 'MAP_ART' ? 'Map Art' : section === 'MARKET' ? 'Market' : 'Build'}</span>
          </Link>

          <span className="text-xs font-mono text-[var(--text-muted)]">
            Posting as: <strong className="text-[var(--text-primary)]">{currentUser.minecraftIgn}</strong>
          </span>
        </div>

        {/* Section Tabs Switcher */}
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-muted)] font-medium">Select Marketplace Section:</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'map-art', label: 'Map Art', icon: Layers },
              { id: 'market', label: 'Buy / Sell Items', icon: Package },
              { id: 'build', label: 'Build Services', icon: Wrench },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = sectionParam === s.id;
              return (
                <Link
                  key={s.id}
                  href={`/create/${s.id}`}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--surface-elevate)] text-[var(--text-primary)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[var(--accent)]" />
                  <span>{s.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Creation Form */}
        <form onSubmit={handleSubmit} className="border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 rounded-lg space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Create {section === 'MAP_ART' ? 'Map Art Listing' : section === 'MARKET' ? 'Trade Classified' : 'Build Contract'}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              All transactions must be conducted in Donut SMP in-game currency. Real-money offers are automatically flagged.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-[#F85149]/10 border border-[#F85149]/30 rounded text-xs text-[#F85149]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Kind Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Listing Kind
            </label>
            <div className="flex gap-3">
              {section === 'MAP_ART' && (
                <>
                  <button
                    type="button"
                    onClick={() => setKind('ARTWORK')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded border transition-colors ${
                      kind === 'ARTWORK'
                        ? 'border-[var(--accent)] bg-[var(--surface-elevate)] text-[var(--text-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    Finished Artwork for Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind('COMMISSION_OFFER')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded border transition-colors ${
                      kind === 'COMMISSION_OFFER'
                        ? 'border-[var(--accent)] bg-[var(--surface-elevate)] text-[var(--text-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    Custom Commission Offer
                  </button>
                </>
              )}

              {section === 'MARKET' && (
                <>
                  <button
                    type="button"
                    onClick={() => setKind('SELL')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded border transition-colors ${
                      kind === 'SELL'
                        ? 'border-[var(--accent)] bg-[var(--surface-elevate)] text-[var(--text-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    WTS — Want to Sell
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind('BUY')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded border transition-colors ${
                      kind === 'BUY'
                        ? 'border-[var(--accent)] bg-[var(--surface-elevate)] text-[var(--text-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    WTB — Want to Buy
                  </button>
                </>
              )}

              {section === 'BUILD' && (
                <>
                  <button
                    type="button"
                    onClick={() => setKind('SERVICE')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded border transition-colors ${
                      kind === 'SERVICE'
                        ? 'border-[var(--accent)] bg-[var(--surface-elevate)] text-[var(--text-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    Builder Service Offer (Portfolio)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind('REQUEST')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded border transition-colors ${
                      kind === 'REQUEST'
                        ? 'border-[var(--accent)] bg-[var(--surface-elevate)] text-[var(--text-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    Client Project Brief (Hire Builder)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Listing Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Title / Item Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              placeholder={
                section === 'MAP_ART'
                  ? 'e.g. Sunset over Obsidian Spire (Staircase 2x2)'
                  : section === 'MARKET'
                  ? 'e.g. 4x Pig Spawners (Tier 2 Ready)'
                  : 'e.g. Automated 120k/hr Nether Gold & Barter Farm'
              }
              className="w-full px-3.5 py-2.5 bg-[var(--surface-elevate)] border border-[var(--border)] focus:border-[var(--accent)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          {/* Pricing & Shorthand Parser */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                In-Game Price (e.g. 250k, 1.5m, 2b)
              </label>
              <input
                type="text"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="1.25m"
                className="w-full px-3.5 py-2.5 bg-[var(--surface-elevate)] border border-[var(--border)] focus:border-[var(--accent)] rounded-md font-mono text-sm text-[var(--text-primary)] focus:outline-none"
              />
              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                {parsedPrice !== null ? (
                  <span className="text-[#3FB950]">
                    Parsed: {formatCurrency(parsedPrice)} ({parsedPrice.toString()} in-game $)
                  </span>
                ) : priceInput ? (
                  <span className="text-[#F85149]">Invalid in-game format</span>
                ) : (
                  <span>Leave blank if quote-only</span>
                )}
              </div>
            </div>

            <div className="flex items-center sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span>Price is negotiable / open to in-game counter-offers</span>
              </label>
            </div>
          </div>

          {/* Section Specific Parameters */}
          {section === 'MAP_ART' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-md bg-[var(--surface-elevate)]/50 border border-[var(--border)] text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Map Size</label>
                <select
                  value={mapSize}
                  onChange={(e) => setMapSize(e.target.value)}
                  className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="1×1">1×1 Frame</option>
                  <option value="2×2">2×2 Frames (4 total)</option>
                  <option value="3×3">3×3 Frames (9 total)</option>
                  <option value="4×4">4×4 Frames (16 total)</option>
                  <option value="Custom">Custom Size</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">
                  {kind === 'ARTWORK' ? 'Copies Ready in Vault' : 'Open Commission Slots'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={stockOrSlots}
                  onChange={(e) => setStockOrSlots(Number(e.target.value))}
                  className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Staircase, Anime, Landscape"
                  className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>
          )}

          {section === 'MARKET' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-md bg-[var(--surface-elevate)]/50 border border-[var(--border)] text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Spawners">Spawners</option>
                  <option value="Gear">Gear & Tools</option>
                  <option value="Resources">Bulk Resources</option>
                  <option value="Misc">Misc & Rare Items</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>
          )}

          {section === 'BUILD' && (
            <div className="p-4 rounded-md bg-[var(--surface-elevate)]/50 border border-[var(--border)] space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1.5">
                  Build Type Specialties
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Base', 'Farm', 'Redstone', 'Decorative', 'PvP Arena', 'Perimeter'].map((type) => {
                    const checked = buildTypes.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => {
                          setBuildTypes((prev) =>
                            checked ? prev.filter((t) => t !== type) : [...prev, type]
                          );
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                          checked
                            ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-semibold'
                            : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Markdown Description using Phase 2 MarkdownEditor */}
          <div className="space-y-1.5">
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              maxLength={5000}
              placeholder="Describe your map art, item specs, or building contract in Markdown..."
              minHeight="220px"
              label="Description & Delivery Terms (Markdown with Write / Preview tabs)"
            />
          </div>

          {/* Image Uploader using Phase 2 ImageUploader */}
          <div className="space-y-1.5">
            <ImageUploader
              images={images}
              onChange={setImages}
              maxCount={section === 'MAP_ART' || section === 'BUILD' ? 10 : 4}
              label={
                section === 'MAP_ART'
                  ? 'Map Art Renders & Screenshots (1–10 images)'
                  : section === 'BUILD'
                  ? 'Portfolio Screenshots or Reference Photos (1–10 images)'
                  : 'Item Screenshots (0–4 images)'
              }
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors rounded-md shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Listing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
