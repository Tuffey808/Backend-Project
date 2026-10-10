'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import type { Category } from '@/lib/api';
import { uploadImage, uploadImages } from '@/lib/api';
import { useLocale } from '@/lib/i18n/LocaleProvider';

function splitLines(value: FormDataEntryValue | null) {
  return String(value || '')
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type ProductFormValues = {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  status?: string;
  sku?: string;
  qtyAvailable?: number;
  imageUrl?: string;
  categoryId?: string;
  images?: Array<{ url: string; sortOrder?: number }>;
  options?: Array<{
    kind: 'SIZE' | 'COLOR' | 'DIMENSION';
    name: string;
    nameAr?: string;
    color?: string;
    sortOrder?: number;
  }>;
};

type Props = {
  token: string;
  categories: Category[];
  defaultStatus?: string;
  submitLabel?: string;
  hideStatus?: boolean;
  initialValues?: Partial<ProductFormValues> & {
    sizesText?: string;
    colorsText?: string;
  };
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

export function ProductForm({
  token,
  categories,
  defaultStatus = 'PUBLISHED',
  submitLabel,
  hideStatus = false,
  initialValues,
  onSubmit,
}: Props) {
  const { t } = useLocale();
  const f = t.admin.productForm;
  const buttonLabel = submitLabel || f.save;
  const formRef = useRef<HTMLFormElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!mainFile) {
      setMainPreview(null);
      return;
    }
    const url = URL.createObjectURL(mainFile);
    setMainPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mainFile]);

  useEffect(() => {
    const urls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [galleryFiles]);

  function resetImages() {
    setMainFile(null);
    setGalleryFiles([]);
    if (mainInputRef.current) mainInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setUploading(true);

    const form = new FormData(e.currentTarget);
    const sizes = splitLines(form.get('sizes'));
    const colors = splitLines(form.get('colors'));

    try {
      let imageUrl: string | undefined;
      let galleryUrls: string[] = [];

      if (mainFile) {
        const res = await uploadImage(token, mainFile);
        imageUrl = res.url;
      }

      if (galleryFiles.length) {
        const res = await uploadImages(token, galleryFiles);
        galleryUrls = res.urls;
      }

      if (!imageUrl && galleryUrls[0]) {
        imageUrl = galleryUrls[0];
      }
      if (!imageUrl && initialValues?.imageUrl) {
        imageUrl = initialValues.imageUrl;
      }

      const images =
        galleryUrls.length > 0
          ? galleryUrls.map((url, index) => ({ url, sortOrder: index }))
          : initialValues?.images;

      await onSubmit({
        name: String(form.get('name')),
        nameAr: String(form.get('nameAr') || '') || undefined,
        description: String(form.get('description') || '') || undefined,
        descriptionAr: String(form.get('descriptionAr') || '') || undefined,
        price: Number(form.get('price')),
        status: String(form.get('status') || defaultStatus),
        sku: String(form.get('sku') || '') || undefined,
        qtyAvailable: Number(form.get('qtyAvailable') || 0),
        imageUrl,
        categoryId: String(form.get('categoryId') || '') || undefined,
        images,
        options: [
          ...sizes.map((name, index) => ({
            kind: 'SIZE' as const,
            name,
            sortOrder: index,
          })),
          ...colors.map((entry, index) => {
            const [name, color] = entry.split(':').map((s) => s.trim());
            return {
              kind: 'COLOR' as const,
              name,
              color: color || '#888888',
              sortOrder: index,
            };
          }),
        ],
      });

      if (!initialValues) {
        formRef.current?.reset();
        resetImages();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : f.uploading);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          {f.nameEn} *
          <input
            name="name"
            required
            defaultValue={initialValues?.name || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {f.nameAr}
          <input
            name="nameAr"
            dir="rtl"
            defaultValue={initialValues?.nameAr || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          {f.descEn}
          <textarea
            name="description"
            rows={3}
            defaultValue={initialValues?.description || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {f.descAr}
          <textarea
            name="descriptionAr"
            dir="rtl"
            rows={3}
            defaultValue={initialValues?.descriptionAr || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm">
          {f.sku}
          <input
            name="sku"
            defaultValue={initialValues?.sku || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {f.price} *
          <input
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={initialValues?.price ?? ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {f.qty}
          <input
            name="qtyAvailable"
            type="number"
            defaultValue={initialValues?.qtyAvailable ?? 10}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
      </div>

      <div className={`grid gap-4 ${hideStatus ? '' : 'md:grid-cols-2'}`}>
        <label className="block text-sm">
          {f.category}
          <select
            name="categoryId"
            defaultValue={initialValues?.categoryId || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          >
            <option value="">{f.noCategory}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.nameAr ? `/ ${c.nameAr}` : ''}
              </option>
            ))}
          </select>
        </label>
        {hideStatus ? (
          <input type="hidden" name="status" value={defaultStatus} />
        ) : (
          <label className="block text-sm">
            {f.status}
            <select
              name="status"
              defaultValue={initialValues?.status || defaultStatus}
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            >
              <option value="PUBLISHED">{f.published}</option>
              <option value="PENDING">{f.pending}</option>
              <option value="DRAFT">{f.draft}</option>
            </select>
          </label>
        )}
      </div>

      <label className="block text-sm">
        {f.mainImage}
        <input
          ref={mainInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2 file:me-3 file:rounded-lg file:border-0 file:bg-[#faf6ef] file:px-3 file:py-1.5 file:text-sm"
          onChange={(e) => setMainFile(e.target.files?.[0] ?? null)}
        />
        <span className="mt-1 block text-xs text-[#78716c]">{f.mainImageHint}</span>
        {(mainPreview || initialValues?.imageUrl) && (
          <img
            src={mainPreview || initialValues?.imageUrl || ''}
            alt=""
            className="mt-3 h-32 w-32 rounded-xl border border-[#e7e5e4] object-cover"
          />
        )}
      </label>

      <label className="block text-sm">
        {f.gallery}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2 file:me-3 file:rounded-lg file:border-0 file:bg-[#faf6ef] file:px-3 file:py-1.5 file:text-sm"
          onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
        />
        <span className="mt-1 block text-xs text-[#78716c]">{f.galleryHint}</span>
        {galleryPreviews.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {galleryPreviews.map((src, index) => (
              <img
                key={`${src}-${index}`}
                src={src}
                alt=""
                className="h-20 w-20 rounded-xl border border-[#e7e5e4] object-cover"
              />
            ))}
          </div>
        )}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          {f.sizes}
          <input
            name="sizes"
            defaultValue={initialValues?.sizesText || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {f.colors}
          <input
            name="colors"
            defaultValue={initialValues?.colorsText || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
      </div>

      {formError && <p className="text-sm text-red-700">{formError}</p>}

      <button
        type="submit"
        disabled={uploading}
        className="rounded-xl bg-[#8a6a1f] px-6 py-2.5 text-white hover:bg-[#735818] disabled:opacity-60"
      >
        {uploading ? f.uploading : buttonLabel}
      </button>
    </form>
  );
}
