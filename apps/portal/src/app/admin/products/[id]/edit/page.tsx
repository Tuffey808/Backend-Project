'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm, type ProductFormValues } from '@/components/products/ProductForm';
import {
  getCategories,
  getProduct,
  updateProduct,
  type Category,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function EditProductPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [initial, setInitial] = useState<
    (Partial<ProductFormValues> & { sizesText?: string; colorsText?: string }) | null
  >(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !params.id) return;
    Promise.all([getCategories(), getProduct(token, params.id)])
      .then(([cats, product]) => {
        setCategories(cats);
        const sizes = Array.isArray(product.size_ids)
          ? (product.size_ids as Array<{ name?: string }>)
              .map((s) => s.name)
              .filter(Boolean)
              .join(', ')
          : '';
        const colors = Array.isArray(product.color_ids)
          ? (product.color_ids as Array<{ name?: string; color?: string }>)
              .map((c) => (c.color ? `${c.name}:${c.color}` : c.name))
              .filter(Boolean)
              .join(', ')
          : '';
        const gallery = Array.isArray(product.product_template_image_ids)
          ? (
              product.product_template_image_ids as Array<{ image_1920?: string }>
            ).map((img, index) => ({
              url: String(img.image_1920 || ''),
              sortOrder: index,
            }))
          : [];
        setInitial({
          name: String(product.name || ''),
          nameAr:
            product.name_ar && product.name_ar !== false
              ? String(product.name_ar)
              : '',
          description:
            product.description_sale && product.description_sale !== false
              ? String(product.description_sale)
              : '',
          descriptionAr:
            product.description_sale_ar && product.description_sale_ar !== false
              ? String(product.description_sale_ar)
              : '',
          price: Number(product.list_price || 0),
          status: String(product.status || 'DRAFT'),
          sku:
            product.sku && product.sku !== false ? String(product.sku) : '',
          qtyAvailable: Number(product.qty_available || 0),
          imageUrl:
            product.image_1920 && product.image_1920 !== false
              ? String(product.image_1920)
              : undefined,
          categoryId:
            product.categoryId && product.categoryId !== false
              ? String(product.categoryId)
              : '',
          images: gallery,
          sizesText: sizes,
          colorsText: colors,
        });
      })
      .catch((e) => setError(e.message));
  }, [token, params.id]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <Link href="/admin/products" className="text-sm text-[#8a6a1f]">
          ← المنتجات
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">تعديل المنتج</h1>
      </header>
      {error && <p className="mb-4 text-red-700">{error}</p>}
      {token && initial && (
        <ProductForm
          token={token}
          categories={categories}
          defaultStatus={initial.status || 'PUBLISHED'}
          initialValues={initial}
          submitLabel="حفظ التعديلات"
          onSubmit={async (values) => {
            await updateProduct(token, params.id, values);
            router.push('/admin/products');
          }}
        />
      )}
    </div>
  );
}
