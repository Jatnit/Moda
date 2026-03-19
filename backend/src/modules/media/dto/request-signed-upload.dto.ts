import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum MediaOwnerType {
  PRODUCT = 'product',
  POST = 'post',
  BUILDER = 'builder',
  AVATAR = 'avatar'
}

export class RequestSignedUploadDto {
  @IsEnum(MediaOwnerType)
  ownerType!: MediaOwnerType;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  fileSize!: number;
}
