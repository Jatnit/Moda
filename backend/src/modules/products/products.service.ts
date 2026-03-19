import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  }

  detail(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  create(data: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        images: data.images as Prisma.InputJsonValue
      }
    });
  }
}
