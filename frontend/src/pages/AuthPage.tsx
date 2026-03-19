import { FormEvent, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [result, setResult] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email, password } : { email, password, fullName };
      const response = await api.post(endpoint, payload);
      const token = response.data?.accessToken as string | undefined;
      const role = response.data?.user?.role as string | undefined;
      if (token) {
        localStorage.setItem('moda_access_token', token);
      }
      setResult(JSON.stringify(response.data, null, 2));
      if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR') {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as any)?.message ??
          error.response?.statusText ??
          error.message ??
          'Auth request failed.';
        setResult(typeof message === 'string' ? message : JSON.stringify(message, null, 2));
        return;
      }
      setResult('Auth request failed.');
    }
  };

  return (
    <section className="page-section">
      <div className="auth-layout">
        <div className="auth-card">
          <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
          <p className="muted">Access your account to continue shopping and checkout.</p>
          <form onSubmit={submit} className="stack">
            {mode === 'register' ? (
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
            ) : null}
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
            />
            <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
          </form>
          <button className="ghost" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            Switch to {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </div>
        <aside className="auth-side">
          <h3>Moda Club Benefits</h3>
          <p>Nhận ưu đãi sớm cho collection mới, mã giảm giá theo hạng và lịch sử mua hàng cá nhân hóa.</p>
          <div className="chip-row">
            <span className="chip">Early Access</span>
            <span className="chip">Member Price</span>
            <span className="chip">Style Profile</span>
          </div>
        </aside>
      </div>
      <pre>{result}</pre>
    </section>
  );
}
