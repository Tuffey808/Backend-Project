import { Module } from '@nestjs/common';
import { AddressesModule } from './addresses/addresses.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { CommissionsModule } from './commissions/commissions.module';
import { ContractsModule } from './contracts/contracts.module';
import { CustomersModule } from './customers/customers.module';
import { FavoritesModule } from './favorites/favorites.module';
import { HealthModule } from './health/health.module';
import { DisputesModule } from './disputes/disputes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { DiscountCodesModule } from './discount-codes/discount-codes.module';
import { ProductsModule } from './products/products.module';
import { ReturnsModule } from './returns/returns.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UploadsModule } from './uploads/uploads.module';
import { VendorApplicationsModule } from './vendor-applications/vendor-applications.module';
import { VendorsModule } from './vendors/vendors.module';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    AuthModule,
    ProductsModule,
    DiscountCodesModule,
    UploadsModule,
    CategoriesModule,
    ContractsModule,
    CustomersModule,
    CartModule,
    AddressesModule,
    OrdersModule,
    PaymentsModule,
    FavoritesModule,
    HealthModule,
    CardsModule,
    VendorApplicationsModule,
    VendorsModule,
    CommissionsModule,
    ReviewsModule,
    NotificationsModule,
    ReturnsModule,
    DisputesModule,
  ],
})
export class AppModule {}
