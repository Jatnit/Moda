import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
import { sanitizeText } from '../../../common/utils/sanitize.util';

export class RegisterDto {
  @Transform(({ value }) => sanitizeText(String(value ?? '')).toLowerCase())
  @IsEmail()
  email!: string;

  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  @MinLength(8)
  password!: string;

  @Transform(({ value }) => sanitizeText(String(value ?? '')))
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
