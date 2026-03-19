import { IsBoolean } from 'class-validator';

export class LockUserDto {
  @IsBoolean()
  locked!: boolean;
}
