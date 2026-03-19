import { Body, Controller, Get, Put } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  list() {
    return this.settingsService.list();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  upsert(@Body() body: UpsertSettingDto) {
    return this.settingsService.upsert(body.key, body.value);
  }
}
