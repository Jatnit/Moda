import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AttachMediaDto {
  @IsString()
  publicId!: string;

  @IsString()
  secureUrl!: string;

  @IsString()
  resourceType!: string;

  @IsString()
  format!: string;

  @IsInt()
  @Min(0)
  width!: number;

  @IsInt()
  @Min(0)
  height!: number;

  @IsInt()
  @Min(0)
  bytes!: number;

  @IsString()
  folder!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsString()
  ownerType!: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean;
}

