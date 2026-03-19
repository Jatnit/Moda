import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AdminBuilderPage } from '../pages/admin/AdminBuilderPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { MediaManagerPage } from '../pages/admin/MediaManagerPage';
import { AdminSiteSettingsPage } from '../pages/admin/AdminSiteSettingsPage';
import { AuthPage } from '../pages/AuthPage';
import { CartPage } from '../pages/shop/CartPage';
import { CheckoutPage } from '../pages/shop/CheckoutPage';
import { HomePage } from '../pages/shop/HomePage';
import { ProductDetailPage } from '../pages/shop/ProductDetailPage';
import { ProductListPage } from '../pages/shop/ProductListPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/settings" element={<AdminSiteSettingsPage />} />
        <Route path="/admin/builder" element={<AdminBuilderPage />} />
        <Route path="/admin/media" element={<MediaManagerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
