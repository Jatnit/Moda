import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppRole, hasAnyRole, isAuthenticated } from '../auth/session';

export function ProtectedRoute(props: { children: ReactElement; roles?: AppRole[] }) {
  const { children, roles } = props;
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !hasAnyRole(roles)) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
