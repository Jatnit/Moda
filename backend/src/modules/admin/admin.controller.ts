import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('orders')
  listOrders() {
    return this.adminService.listOrders();
  }

  @Get('orders/:id/history')
  orderHistory(@Param('id') id: string) {
    return this.adminService.listOrderHistory(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: OrderStatus; note?: string }) {
    return this.adminService.updateOrderStatus(id, body.status, body.note);
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsersAdvanced();
  }

  @Patch('users/:id/lock')
  lockUser(@Param('id') id: string, @Body() body: { locked: boolean }) {
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
  createCategory(@Body() body: { name: string; slug: string }) {
    return this.adminService.createCategory(body.name, body.slug);
  }

  @Get('posts/tags')
  listTags() {
    return this.adminService.listTags();
  }

  @Post('posts/tags')
  createTag(@Body() body: { name: string; slug: string }) {
    return this.adminService.createTag(body.name, body.slug);
  }

  @Post('posts')
  createPost(@Body() body: any) {
    return this.adminService.createPostAdvanced(body);
  }

  @Post('access-logs')
  logAccess(@Body() body: { userId?: string; ipAddress?: string; device?: string; route: string; method: string }) {
    return this.adminService.logAccess(body);
  }

  @Get('access-logs')
  listAccessLogs() {
    return this.adminService.listAccessLogs();
  }
}
