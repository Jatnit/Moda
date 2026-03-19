import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpsertPostAdvancedDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(180)
  slug!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'PRIVATE', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
