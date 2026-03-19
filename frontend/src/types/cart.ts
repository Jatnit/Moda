export type { CartItem } from '../utils/cart';

export interface OrderItem {
  productId: string;
  quantity: number;
  price?: number;
  name?: string;
}
