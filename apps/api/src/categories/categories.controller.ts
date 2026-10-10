import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CategoriesService } from './categories.service';

class CategoryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@Controller()
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Post('api/getCategories')
  getCategoriesMobile() {
    return this.categories.listForMobile();
  }

  @Get('api/categories')
  list() {
    return this.categories.list();
  }

  @Get('api/categories/:id')
  get(@Param('id') id: string) {
    return this.categories.get(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('api/categories')
  create(@Body() dto: CategoryDto) {
    return this.categories.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('api/categories/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(id, dto);
  }
}
