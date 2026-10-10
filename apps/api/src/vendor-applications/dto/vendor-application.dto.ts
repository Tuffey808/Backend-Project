import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateVendorApplicationDto {
  @IsString()
  @MinLength(2)
  businessName!: string;

  @IsString()
  @MinLength(2)
  contactName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  phone!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  commercialRegister?: string;
}

export class ReviewVendorApplicationDto {
  @IsOptional()
  approve?: boolean;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
