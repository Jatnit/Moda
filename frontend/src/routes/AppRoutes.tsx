import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

const HomePage = lazy(() => import('../pages/shop/HomePage').then((mod) => ({ default: mod.HomePage })));
const ProductListPage = lazy(() =>
  import('../pages/shop/ProductListPage').then((mod) => ({ default: mod.ProductListPage }))
);
const ProductDetailPage = lazy(() =>
  import('../pages/shop/ProductDetailPage').then((mod) => ({ default: mod.ProductDetailPage }))
);
const CartPage = lazy(() => import('../pages/shop/CartPage').then((mod) => ({ default: mod.CartPage })));
const CheckoutPage = lazy(() => import('../pages/shop/CheckoutPage').then((mod) => ({ default: mod.CheckoutPage })));
const AuthPage = lazy(() => import('../pages/AuthPage').then((mod) => ({ default: mod.AuthPage })));
const AdminDashboardPage = lazy(() =>
  import('../pages/admin/AdminDashboardPage').then((mod) => ({ default: mod.AdminDashboardPage }))
);
const AdminSiteSettingsPage = lazy(() =>
  import('../pages/admin/AdminSiteSettingsPage').then((mod) => ({ default: mod.AdminSiteSettingsPage }))
);
const AdminBuilderPage = lazy(() =>
  import('../pages/admin/AdminBuilderPage').then((mod) => ({ default: mod.AdminBuilderPage }))
);
const MediaManagerPage = lazy(() =>
  import('../pages/admin/MediaManagerPage').then((mod) => ({ default: mod.MediaManagerPage }))
);
const UserDashboardPage = lazy(() =>
  import('../pages/UserDashboardPage').then((mod) => ({ default: mod.UserDashboardPage }))
);

export function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                <AdminSiteSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/builder"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
                <AdminBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/media"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
                <MediaManagerPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
