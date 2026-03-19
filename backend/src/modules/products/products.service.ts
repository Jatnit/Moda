import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

function toId(value: string): bigint {
  return BigInt(value);
}

function serializeProduct(row: any) {
  if (!row) return null;
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    price: Number(row.price ?? 0),
    stock: Number(row.stock ?? 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.product.findMany({
      where: { status: 'ACTIVE' as any },
      orderBy: { createdAt: 'desc' }
    });
    return rows.map(serializeProduct);
  }

  async detail(id: string) {
    const row = await this.prisma.product.findUnique({ where: { id: toId(id) } });
    return serializeProduct(row);
  }

  async create(data: CreateProductDto) {
    const row = await this.prisma.product.create({
      data: {
        sku: `SKU-${Date.now()}`,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock ?? 0),
        status: 'ACTIVE' as any
      }
    });
    return serializeProduct(row);
  }
}
