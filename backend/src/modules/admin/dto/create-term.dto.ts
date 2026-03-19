import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateTermDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(180)
  slug!: string;
}
