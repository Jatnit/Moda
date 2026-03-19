import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttachMediaDto } from './dto/attach-media.dto';
import { RequestSignedUploadDto } from './dto/request-signed-upload.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list() {
    return this.mediaService.list();
  }

  @Post('signed-upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  signedUpload(@Body() body: RequestSignedUploadDto) {
    return this.mediaService.buildSignedUploadParams(body);
  }

  @Post('attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  attach(@Body() body: AttachMediaDto) {
    return this.mediaService.createMetadata(body);
  }

  @Get('transform')
  transform(@Query('url') url: string) {
    return { optimizedUrl: this.mediaService.transformToOptimizedUrl(url ?? '') };
  }

  @Get('variants')
  variants(@Query('url') url: string) {
    return this.mediaService.buildResponsiveVariants(url ?? '');
  }

  @Post('cleanup-orphans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  cleanupOrphans() {
    return this.mediaService.cleanupOrphans();
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  remove(@Body('publicId') publicId: string) {
    return this.mediaService.deleteByPublicId(publicId);
  }
}
