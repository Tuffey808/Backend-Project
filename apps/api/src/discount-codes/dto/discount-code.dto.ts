import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDiscountCodeDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentOff?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountOff?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateDiscountCodeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentOff?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountOff?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number | null;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}
