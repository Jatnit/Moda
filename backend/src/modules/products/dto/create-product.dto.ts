import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { sanitizeText } from '../../../common/utils/sanitize.util';

export class CreateProductDto {
  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  name!: string;

  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  slug!: string;

  @IsOptional()
  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsArray()
  @IsString({ each: true })
  images!: string[];
}

