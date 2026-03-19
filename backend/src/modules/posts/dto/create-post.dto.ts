import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { sanitizeText } from '../../../common/utils/sanitize.util';

export class CreatePostDto {
  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  title!: string;

  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  slug!: string;

  @IsOptional()
  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  excerpt?: string;

  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  content!: string;
}

