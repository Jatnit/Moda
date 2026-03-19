import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateTermDto } from './dto/create-term.dto';
import { LockUserDto } from './dto/lock-user.dto';
import { LogAccessDto } from './dto/log-access.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePostAdvancedDto } from './dto/update-post-advanced.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { UpsertPostAdvancedDto } from './dto/upsert-post-advanced.dto';

@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all orders for admin' })
  listOrders() {
    return this.adminService.listOrders();
  }

  @Get('orders/:id/history')
  orderHistory(@Param('id') id: string) {
    return this.adminService.listOrderHistory(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return this.adminService.updateOrderStatus(id, body.status, body.note);
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsersAdvanced();
  }

  @Patch('users/:id/lock')
  lockUser(@Param('id') id: string, @Body() body: LockUserDto) {
    return this.adminService.lockUser(id, !!body.locked);
  }

  @Patch('users/:id/reset-role')
  resetRole(@Param('id') id: string) {
    return this.adminService.resetRole(id);
  }

  @Get('posts/categories')
  listCategories() {
    return this.adminService.listCategories();
  }

  @Post('posts/categories')
  createCategory(@Body() body: CreateTermDto) {
    return this.adminService.createCategory(body.name, body.slug);
  }

  @Patch('posts/categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: UpdateTermDto) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('posts/categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Get('posts/tags')
  listTags() {
    return this.adminService.listTags();
  }

  @Post('posts/tags')
  createTag(@Body() body: CreateTermDto) {
    return this.adminService.createTag(body.name, body.slug);
  }

  @Patch('posts/tags/:id')
  updateTag(@Param('id') id: string, @Body() body: UpdateTermDto) {
    return this.adminService.updateTag(id, body);
  }

  @Delete('posts/tags/:id')
  deleteTag(@Param('id') id: string) {
    return this.adminService.deleteTag(id);
  }

  @Post('posts')
  createPost(@Body() body: UpsertPostAdvancedDto) {
    return this.adminService.createPostAdvanced(body);
  }

  @Get('posts')
  listPosts() {
    return this.adminService.listPostsAdvanced();
  }

  @Get('posts/:id')
  postDetail(@Param('id') id: string) {
    return this.adminService.getPostAdvanced(id);
  }

  @Patch('posts/:id')
  updatePost(@Param('id') id: string, @Body() body: UpdatePostAdvancedDto) {
    return this.adminService.updatePostAdvanced(id, body);
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    return this.adminService.deletePostAdvanced(id);
  }

  @Post('access-logs')
  logAccess(@Body() body: LogAccessDto) {
    return this.adminService.logAccess(body);
  }

  @Get('access-logs')
  listAccessLogs() {
    return this.adminService.listAccessLogs();
  }
}
