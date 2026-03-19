import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BuilderService } from './builder.service';
import { UseGuards } from '@nestjs/common';

@ApiTags('builder')
@Controller('builder')
export class BuilderController {
  constructor(private readonly builderService: BuilderService) {}

  @Get('pages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  listPages() {
    return this.builderService.listPages();
  }

  @Get('pages/slug/:slug')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  latestBySlug(@Param('slug') slug: string) {
    return this.builderService.latestBySlug(slug);
  }

  @Get('public/:slug')
  publishedBySlug(@Param('slug') slug: string) {
    return this.builderService.publishedBySlug(slug);
  }

  @Post('pages/draft')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  saveDraft(@Body() body: { slug: string; jsonSchema: unknown; createdBy?: string }) {
    return this.builderService.saveDraft(body);
  }

  @Post('pages/:id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  publish(@Param('id') id: string) {
    return this.builderService.publish(id);
  }

  @Get('pages/:id/preview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  preview(@Param('id') id: string) {
    return this.builderService.preview(id);
  }

  @Get('pages/:id/versions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  listVersions(@Param('id') id: string) {
    return this.builderService.listVersions(id);
  }

  @Post('pages/:id/rollback')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  rollback(@Param('id') id: string, @Body() body: { versionId: string }) {
    return this.builderService.rollback(id, body.versionId);
  }

  @Get('templates')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  templates() {
    return this.builderService.listTemplates();
  }

  @Get('reusable-blocks')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  listReusableBlocks() {
    return this.builderService.listReusableBlocks();
  }

  @Post('reusable-blocks')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  saveReusableBlock(@Body() body: { name: string; block: unknown }) {
    return this.builderService.saveReusableBlock(body);
  }
}
