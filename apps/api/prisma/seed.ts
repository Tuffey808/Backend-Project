import {
  PrismaClient,
  ProductOptionKind,
  ProductStatus,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmall.sa' },
    update: {},
    create: {
      email: 'admin@gmall.sa',
      name: 'G-mall Admin',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const customerHash = await bcrypt.hash('Customer123!', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@gmall.sa' },
    update: {
      phone: '0500000000',
      passwordHash: customerHash,
    },
    create: {
      email: 'customer@gmall.sa',
      name: 'Demo Customer',
      passwordHash: customerHash,
      role: Role.CUSTOMER,
      phone: '0500000000',
      customer: {
        create: {
          city: 'Riyadh',
          country: 'SA',
        },
      },
    },
  });

  await prisma.discountCode.upsert({
    where: { code: 'WELCOME10' },
    update: { percentOff: 10, active: true },
    create: {
      code: 'WELCOME10',
      percentOff: 10,
      active: true,
    },
  });

  const vendorHash = await bcrypt.hash('Vendor123!', 10);
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@gmall.sa' },
    update: { passwordHash: vendorHash, role: Role.VENDOR },
    create: {
      email: 'vendor@gmall.sa',
      name: 'Demo Vendor',
      passwordHash: vendorHash,
      role: Role.VENDOR,
      phone: '0500000001',
    },
  });

  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', defaultCommissionPercent: 10 },
  });

  await prisma.vendorProfile.upsert({
    where: { userId: vendor.id },
    update: {
      storeName: 'Demo Store',
      storeNameAr: 'متجر تجريبي',
      city: 'Riyadh',
      active: true,
    },
    create: {
      userId: vendor.id,
      storeName: 'Demo Store',
      storeNameAr: 'متجر تجريبي',
      slug: 'demo-store',
      city: 'Riyadh',
      description: 'Seeded demo vendor storefront.',
      descriptionAr: 'متجر تجريبي للعرض.',
      shippingPolicy: 'Ships within 2-3 business days.',
      returnPolicy: 'Returns within 7 days.',
      active: true,
      featured: true,
    },
  });

  const existingAddress = await prisma.address.findFirst({
    where: { userId: customer.id },
  });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        name: 'Demo Customer',
        street: 'King Fahd Rd',
        city: 'Riyadh',
        state: 'Riyadh',
        zip: '11564',
        mobile: '0500000000',
        country: 'SA',
        isDefault: true,
      },
    });
  }

  await prisma.contract.upsert({
    where: { id: 'seed-contract-1' },
    update: {},
    create: {
      id: 'seed-contract-1',
      title: 'Basic Membership',
      titleAr: 'عضوية أساسية',
      status: 'ACTIVE',
      customerId: customer.id,
      startDate: new Date(),
      terms: 'Demo contract seeded for portal MVP.',
    },
  });

  const category = await prisma.category.upsert({
    where: { id: 'seed-category-apparel' },
    update: {
      name: 'Apparel',
      nameAr: 'ملابس',
    },
    create: {
      id: 'seed-category-apparel',
      name: 'Apparel',
      nameAr: 'ملابس',
      imageUrl: 'https://picsum.photos/seed/gmall-cat/400/400',
    },
  });

  const existing = await prisma.product.findUnique({ where: { sku: 'DEMO-001' } });
  if (existing) {
    await prisma.productOption.deleteMany({ where: { productId: existing.id } });
    await prisma.productImage.deleteMany({ where: { productId: existing.id } });
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: 'Linen Summer Shirt',
        nameAr: 'قميص كتان صيفي',
        description: 'Breathable linen shirt for warm weather.',
        descriptionAr: 'قميص كتان خفيف ومناسب لأجواء الصيف.',
        price: 149.0,
        status: ProductStatus.PUBLISHED,
        qtyAvailable: 25,
        imageUrl: 'https://picsum.photos/seed/gmall-shirt/800/800',
        categoryId: category.id,
        ownerId: admin.id,
        images: {
          create: [
            {
              url: 'https://picsum.photos/seed/gmall-shirt/800/800',
              name: 'Front',
              sortOrder: 0,
            },
            {
              url: 'https://picsum.photos/seed/gmall-shirt-2/800/800',
              name: 'Detail',
              sortOrder: 1,
            },
          ],
        },
        options: {
          create: [
            { kind: ProductOptionKind.SIZE, name: 'S', nameAr: 'ص', sortOrder: 0 },
            { kind: ProductOptionKind.SIZE, name: 'M', nameAr: 'م', sortOrder: 1 },
            { kind: ProductOptionKind.SIZE, name: 'L', nameAr: 'ل', sortOrder: 2 },
            {
              kind: ProductOptionKind.COLOR,
              name: 'Sand',
              nameAr: 'رملي',
              color: '#C2A878',
              sortOrder: 0,
            },
            {
              kind: ProductOptionKind.COLOR,
              name: 'Olive',
              nameAr: 'زيتوني',
              color: '#556B2F',
              sortOrder: 1,
            },
          ],
        },
      },
    });
  } else {
    await prisma.product.create({
      data: {
        name: 'Linen Summer Shirt',
        nameAr: 'قميص كتان صيفي',
        description: 'Breathable linen shirt for warm weather.',
        descriptionAr: 'قميص كتان خفيف ومناسب لأجواء الصيف.',
        price: 149.0,
        status: ProductStatus.PUBLISHED,
        sku: 'DEMO-001',
        qtyAvailable: 25,
        imageUrl: 'https://picsum.photos/seed/gmall-shirt/800/800',
        categoryId: category.id,
        ownerId: admin.id,
        images: {
          create: [
            {
              url: 'https://picsum.photos/seed/gmall-shirt/800/800',
              name: 'Front',
              sortOrder: 0,
            },
            {
              url: 'https://picsum.photos/seed/gmall-shirt-2/800/800',
              name: 'Detail',
              sortOrder: 1,
            },
          ],
        },
        options: {
          create: [
            { kind: ProductOptionKind.SIZE, name: 'S', nameAr: 'ص', sortOrder: 0 },
            { kind: ProductOptionKind.SIZE, name: 'M', nameAr: 'م', sortOrder: 1 },
            { kind: ProductOptionKind.SIZE, name: 'L', nameAr: 'ل', sortOrder: 2 },
            {
              kind: ProductOptionKind.COLOR,
              name: 'Sand',
              nameAr: 'رملي',
              color: '#C2A878',
              sortOrder: 0,
            },
            {
              kind: ProductOptionKind.COLOR,
              name: 'Olive',
              nameAr: 'زيتوني',
              color: '#556B2F',
              sortOrder: 1,
            },
          ],
        },
      },
    });
  }

  console.log('Seeded admin/customer/vendor + DEMO-001 product.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
