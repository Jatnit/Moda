import { IsNumber, IsString, Min } from 'class-validator';

export class InitSepayDto {
  @IsString()
  orderId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}

