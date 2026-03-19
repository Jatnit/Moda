import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
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
}
