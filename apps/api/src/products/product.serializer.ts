import {
  Category,
  Product,
  ProductImage,
  ProductOption,
  ProductOptionKind,
  VendorProfile,
} from '@prisma/client';

type OwnerWithProfile = {
  id: string;
  numericId: number;
  name: string;
  vendorProfile?: VendorProfile | null;
};

type ProductWithRelations = Product & {
  category?: Category | null;
  images?: ProductImage[];
  options?: ProductOption[];
  owner?: OwnerWithProfile | null;
};

function optionsByKind(
  options: ProductOption[] | undefined,
  kind: ProductOptionKind,
) {
  return (options || [])
    .filter((o) => o.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((o) => ({
      id: o.numericId,
      name: o.name,
      name_ar: o.nameAr || false,
      color: o.color || (kind === ProductOptionKind.COLOR ? '#000000' : ''),
    }));
}

/** Mobile-compatible product payload */
export function serializeProductForMobile(product: ProductWithRelations) {
  const gallery = (product.images || [])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => ({
      id: img.numericId,
      name: img.name || false,
      image_1920: img.url,
    }));

  const mainImage = product.imageUrl || gallery[0]?.image_1920 || false;
  const categ = product.category;
  const profile = product.owner?.vendorProfile;
  const vendor = product.owner
    ? {
        id: product.owner.id,
        numericId: product.owner.numericId,
        name: profile?.storeName || product.owner.name,
        name_ar: profile?.storeNameAr || false,
        slug: profile?.slug || false,
        logo: profile?.logoUrl || false,
        city: profile?.city || false,
      }
    : false;

  return {
    id: product.numericId,
    _id: product.id,
    name: product.name || false,
    name_ar: product.nameAr || false,
    list_price: Number(product.price),
    description_sale: product.description || false,
    description_sale_ar: product.descriptionAr || false,
    qty_available: product.qtyAvailable,
    taxes_id: [],
    vendor,
    vendor_id: product.ownerId || false,
    categoryId: product.categoryId || false,
    categ_id: categ
      ? {
          id: categ.numericId,
          _id: categ.id,
          name: categ.name,
          name_ar: categ.nameAr || false,
          image_1920: categ.imageUrl || false,
        }
      : false,
    create_uid: product.owner?.numericId || 0,
    size_ids: optionsByKind(product.options, ProductOptionKind.SIZE),
    color_ids: optionsByKind(product.options, ProductOptionKind.COLOR),
    dimension_ids: optionsByKind(product.options, ProductOptionKind.DIMENSION),
    image_1920: mainImage,
    product_template_image_ids: gallery,
    currency: product.currency,
    sku: product.sku || false,
    status: product.status,
  };
}

export function serializeCategoryForMobile(
  category: Category & { _count?: { products: number } },
) {
  return {
    id: category.numericId,
    _id: category.id,
    name: category.name,
    name_ar: category.nameAr || false,
    image_1920: category.imageUrl || false,
    product_count: category._count?.products ?? undefined,
  };
}

export const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  options: { orderBy: { sortOrder: 'asc' as const } },
  owner: {
    select: {
      id: true,
      numericId: true,
      name: true,
      vendorProfile: true,
    },
  },
};
