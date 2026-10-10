import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DiscountCodesService } from './discount-codes.service';
import {
  CreateDiscountCodeDto,
  UpdateDiscountCodeDto,
} from './dto/discount-code.dto';

@Controller('api/admin/discount-codes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DiscountCodesController {
  constructor(private readonly discountCodes: DiscountCodesService) {}

  @Get()
  list() {
    return this.discountCodes.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.discountCodes.get(id);
  }

  @Post()
  create(@Body() dto: CreateDiscountCodeDto) {
    return this.discountCodes.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDiscountCodeDto) {
    return this.discountCodes.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountCodes.remove(id);
  }
}
