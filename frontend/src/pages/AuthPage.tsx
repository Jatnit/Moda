import { FormEvent, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import './AuthPage.css';

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email, password } : { email, password, fullName };
      const response = await api.post(endpoint, payload);
      const token = response.data?.accessToken as string | undefined;
      const role = response.data?.user?.role as string | undefined;
      if (token) {
        localStorage.setItem('moda_access_token', token);
      }
      if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR') {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as any)?.message ??
          err.response?.statusText ??
          err.message ??
          'Đã xảy ra lỗi.';
        setError(typeof message === 'string' ? message : JSON.stringify(message));
        return;
      }
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container animate-fade-up">
      <div className="auth-page__layout">
        {/* Form side */}
        <div className="auth-page__form-card">
          <div className="auth-page__header">
            <h2>{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}</h2>
            <p className="text-muted">
              {mode === 'login'
                ? 'Đăng nhập để tiếp tục mua sắm và quản lý đơn hàng.'
                : 'Đăng ký để nhận ưu đãi đặc biệt dành cho thành viên.'}
            </p>
          </div>

          <form onSubmit={submit} className="auth-page__form">
            {mode === 'register' && (
              <div className="auth-page__field">
                <label htmlFor="auth-fullname">Họ và tên</label>
                <input
                  id="auth-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Họ và tên của bạn"
                  required
                />
              </div>
            )}
            <div className="auth-page__field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="auth-page__field">
              <label htmlFor="auth-password">Mật khẩu</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="auth-page__error">{error}</div>}

            <button type="submit" className="btn-accent auth-page__submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          <div className="auth-page__switch">
            <span className="text-muted">
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </span>
            <button
              type="button"
              className="auth-page__switch-btn"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>

        {/* Right side */}
        <aside className="auth-page__side">
          <div className="auth-page__side-content">
            <h3>Moda Club</h3>
            <p>Tham gia cộng đồng thời trang trẻ trung và nhận nhiều ưu đãi độc quyền.</p>
            <div className="auth-page__benefits">
              <div className="auth-page__benefit">
                <span className="auth-page__benefit-icon">🎯</span>
                <div>
                  <strong>Early Access</strong>
                  <p>Xem trước bộ sưu tập mới</p>
                </div>
              </div>
              <div className="auth-page__benefit">
                <span className="auth-page__benefit-icon">💰</span>
                <div>
                  <strong>Member Price</strong>
                  <p>Giá ưu đãi dành riêng</p>
                </div>
              </div>
              <div className="auth-page__benefit">
                <span className="auth-page__benefit-icon">✨</span>
                <div>
                  <strong>Style Profile</strong>
                  <p>Gợi ý cá nhân hóa</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
