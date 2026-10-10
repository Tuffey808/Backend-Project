import { Module } from '@nestjs/common';
import { AddressesModule } from '../addresses/addresses.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminOrdersController, OrderTrackingController } from './admin-orders.controller';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VendorOrdersController } from './vendor-orders.controller';

@Module({
  imports: [AddressesModule, NotificationsModule],
  controllers: [
    OrdersController,
    AdminOrdersController,
    OrderTrackingController,
    VendorOrdersController,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
