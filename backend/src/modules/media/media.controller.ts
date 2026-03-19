import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  attach(@Body() body: Record<string, unknown>) {
    return this.mediaService.createMetadata({
      publicId: String(body.publicId ?? ''),
      secureUrl: String(body.secureUrl ?? ''),
      resourceType: String(body.resourceType ?? 'image'),
      format: String(body.format ?? 'jpg'),
      width: Number(body.width ?? 0),
      height: Number(body.height ?? 0),
      bytes: Number(body.bytes ?? 0),
      folder: String(body.folder ?? ''),
      altText: body.altText ? String(body.altText) : undefined,
      ownerType: String(body.ownerType ?? 'builder'),
      ownerId: body.ownerId ? String(body.ownerId) : undefined,
      createdBy: body.createdBy ? String(body.createdBy) : undefined
    });
  }

  @Get('transform')
  transform(@Query('url') url: string) {
    return { optimizedUrl: this.mediaService.transformToOptimizedUrl(url ?? '') };
  }

  @Delete()
  remove(@Body('publicId') publicId: string) {
    return this.mediaService.deleteByPublicId(publicId);
  }
}
