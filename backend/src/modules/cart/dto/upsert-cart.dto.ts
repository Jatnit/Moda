import { IsArray } from 'class-validator';

export class UpsertCartDto {
  @IsArray()
  items!: unknown[];
}

