import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LogAccessDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  device?: string;

  @IsString()
  @MaxLength(255)
  route!: string;

  @IsString()
  @MaxLength(10)
  method!: string;
}
