import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  signedUpload(@Body() body: RequestSignedUploadDto) {
    return this.mediaService.buildSignedUploadParams(body);
  }

  @Post('attach')
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
  cleanupOrphans() {
    return this.mediaService.cleanupOrphans();
  }

  @Delete()
  remove(@Body('publicId') publicId: string) {
    return this.mediaService.deleteByPublicId(publicId);
  }
}
