import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BuilderService } from './builder.service';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';

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
  saveDraft(@Req() req: Request, @Body() body: { slug: string; jsonSchema: unknown }) {
    return this.builderService.saveDraft({
      ...body,
      createdBy: String((req as any).user?.sub ?? '')
    });
  }

  @Post('pages/:id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  publish(@Req() req: Request, @Param('id') id: string) {
    return this.builderService.publish(id, String((req as any).user?.sub ?? ''));
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
  rollback(@Req() req: Request, @Param('id') id: string, @Body() body: { versionId: string }) {
    return this.builderService.rollback(id, body.versionId, String((req as any).user?.sub ?? ''));
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
  saveReusableBlock(@Req() req: Request, @Body() body: { name: string; block: unknown }) {
    return this.builderService.saveReusableBlock({
      ...body,
      actorId: String((req as any).user?.sub ?? '')
    });
  }
}
