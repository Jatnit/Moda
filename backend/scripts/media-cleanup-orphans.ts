// @ts-nocheck
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const items = await prisma.media.findMany({
      where: { ownerId: { not: null } },
      select: { id: true, ownerType: true, ownerId: true }
    });

    const orphanIds: string[] = [];
    for (const item of items) {
      const ownerId = item.ownerId ?? '';
      let exists = true;
      if (item.ownerType === 'product') {
        exists = !!(await prisma.product.findUnique({ where: { id: ownerId }, select: { id: true } }));
      } else if (item.ownerType === 'post') {
        exists = !!(await prisma.post.findUnique({ where: { id: ownerId }, select: { id: true } }));
      } else if (item.ownerType === 'builder') {
        exists = !!(await prisma.page.findUnique({ where: { id: ownerId }, select: { id: true } }));
      } else if (item.ownerType === 'avatar') {
        exists = !!(await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true } }));
      }

      if (!exists) orphanIds.push(item.id);
    }

    const deleted = orphanIds.length ? await prisma.media.deleteMany({ where: { id: { in: orphanIds } } }) : { count: 0 };
    console.log(`checked=${items.length} deleted=${deleted.count}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
