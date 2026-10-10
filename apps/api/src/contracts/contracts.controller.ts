import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Controller('api/contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contracts: ContractsService) {}

  @Get()
  list(@Req() req: { user: { id: string; role: Role } }) {
    return this.contracts.list(req.user);
  }

  @Get(':id')
  get(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: Role } },
  ) {
    return this.contracts.get(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.contracts.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
    @Req() req: { user: { id: string; role: Role } },
  ) {
    return this.contracts.update(id, dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contracts.remove(id);
  }
}
