import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list() {
    return this.productsService.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.productsService.detail(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(body);
  }
}
