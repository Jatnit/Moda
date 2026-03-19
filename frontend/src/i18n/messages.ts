export type Locale = 'vi' | 'en';

type Dictionary = Record<string, string>;

export const messages: Record<Locale, Dictionary> = {
  vi: {
    nav_home: 'Trang chủ',
    nav_products: 'Sản phẩm',
    nav_cart: 'Giỏ hàng',
    nav_checkout: 'Thanh toán',
    nav_auth: 'Tài khoản',
    nav_admin: 'Quản trị',
    nav_settings: 'Cài đặt',
    nav_builder: 'Builder',
    nav_media: 'Media',
    lang_label: 'Ngôn ngữ'
  },
  en: {
    nav_home: 'Home',
    nav_products: 'Products',
    nav_cart: 'Cart',
    nav_checkout: 'Checkout',
    nav_auth: 'Auth',
    nav_admin: 'Admin',
    nav_settings: 'Settings',
    nav_builder: 'Builder',
    nav_media: 'Media',
    lang_label: 'Language'
  }
};
