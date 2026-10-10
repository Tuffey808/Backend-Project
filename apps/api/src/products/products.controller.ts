import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  /** Mobile-compatible catalog routes */
  @Post('api/getProducts')
  getProductsMobile() {
    return this.products.listForMobile();
  }

  @Get('api/products/search/')
  searchProducts(
    @Query('product') product?: string,
    @Query('category') category?: string,
    @Query('vendor') vendor?: string,
  ) {
    return this.products.searchForMobile({ product, category, vendor });
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('api/products')
  list(@Req() req: { user?: { id: string; role: Role } }) {
    return this.products.list(req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('api/products/:id')
  get(
    @Param('id') id: string,
    @Req() req: { user?: { id: string; role: Role } },
  ) {
    return this.products.get(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDOR)
  @Post('api/products')
  create(
    @Body() dto: CreateProductDto,
    @Req() req: { user: { id: string; role: Role } },
  ) {
    return this.products.create(dto, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDOR)
  @Patch('api/products/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: { user: { id: string; role: Role } },
  ) {
    return this.products.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDOR)
  @Delete('api/products/:id')
  remove(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: Role } },
  ) {
    return this.products.remove(id, req.user);
  }
}
