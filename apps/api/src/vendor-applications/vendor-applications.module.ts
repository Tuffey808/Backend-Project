import { Module } from '@nestjs/common';
import { VendorsModule } from '../vendors/vendors.module';
import { VendorApplicationsController } from './vendor-applications.controller';
import { VendorApplicationsService } from './vendor-applications.service';

@Module({
  imports: [VendorsModule],
  controllers: [VendorApplicationsController],
  providers: [VendorApplicationsService],
})
export class VendorApplicationsModule {}
