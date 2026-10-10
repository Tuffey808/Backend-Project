import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewTargetType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

@Controller('api')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('products/:id/reviews')
  productReviews(@Param('id') id: string) {
    return this.reviews.summaryForProduct(id);
  }

  @Get('vendors/:id/reviews')
  vendorReviews(@Param('id') id: string) {
    return this.reviews.listForVendor(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  create(
    @Req() req: { user: { id: string } },
    @Body()
    body: {
      targetType: ReviewTargetType;
      productId?: string;
      vendorId?: string;
      rating: number;
      comment?: string;
    },
  ) {
    return this.reviews.create(req.user.id, body);
  }
}
