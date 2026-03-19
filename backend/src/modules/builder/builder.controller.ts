import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BuilderService } from './builder.service';

@ApiTags('builder')
@Controller('builder')
export class BuilderController {
  constructor(private readonly builderService: BuilderService) {}

  @Get('pages')
  listPages() {
    return this.builderService.listPages();
  }

  @Get('pages/slug/:slug')
  latestBySlug(@Param('slug') slug: string) {
    return this.builderService.latestBySlug(slug);
  }

  @Get('public/:slug')
  publishedBySlug(@Param('slug') slug: string) {
    return this.builderService.publishedBySlug(slug);
  }

  @Post('pages/draft')
  saveDraft(@Body() body: { slug: string; jsonSchema: unknown; createdBy?: string }) {
    return this.builderService.saveDraft(body);
  }

  @Post('pages/:id/publish')
  publish(@Param('id') id: string) {
    return this.builderService.publish(id);
  }

  @Get('pages/:id/preview')
  preview(@Param('id') id: string) {
    return this.builderService.preview(id);
  }

  @Get('pages/:id/versions')
  listVersions(@Param('id') id: string) {
    return this.builderService.listVersions(id);
  }

  @Post('pages/:id/rollback')
  rollback(@Param('id') id: string, @Body() body: { versionId: string }) {
    return this.builderService.rollback(id, body.versionId);
  }

  @Get('templates')
  templates() {
    return this.builderService.listTemplates();
  }

  @Get('reusable-blocks')
  listReusableBlocks() {
    return this.builderService.listReusableBlocks();
  }

  @Post('reusable-blocks')
  saveReusableBlock(@Body() body: { name: string; block: unknown }) {
    return this.builderService.saveReusableBlock(body);
  }
}
