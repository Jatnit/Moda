export type CartItem = {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
};

const KEY = 'moda_cart_items';

export function getCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem) {
  const current = getCartItems();
  const found = current.find((c) => c.productId === item.productId);
  if (found) {
    found.quantity += item.quantity;
    saveCartItems(current);
    return;
  }
  saveCartItems([...current, item]);
}

