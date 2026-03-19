import { useMemo } from 'react';
import { getCurrentRole, getTokenPayload } from '../auth/session';

export function UserDashboardPage() {
  const payload = useMemo(() => getTokenPayload(), []);
  const role = getCurrentRole();

  return (
    <section className="page-section">
      <div className="page-head">
        <h2>User Dashboard</h2>
        <p>Thông tin tài khoản và phân quyền hiện tại của bạn.</p>
      </div>
      <article className="line-card">
        <div>
          <p>
            <strong>Email:</strong> {payload?.email ?? '-'}
          </p>
          <p>
            <strong>User ID:</strong> {payload?.sub ?? '-'}
          </p>
          <p>
            <strong>Role:</strong> {role ?? '-'}
          </p>
        </div>
      </article>
    </section>
  );
}
