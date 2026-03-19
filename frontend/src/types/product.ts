export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  category?: string;
  tags?: string[];
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  createdAt?: string;
}

export interface ProductFilters {
  category?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
  search?: string;
}
