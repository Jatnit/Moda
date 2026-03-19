import { FormEvent, useState } from 'react';
import { api } from '../api/client';

export function AuthPage() {
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
      if (token) {
        localStorage.setItem('moda_access_token', token);
      }
      setResult(JSON.stringify(response.data, null, 2));
    } catch {
      setResult('Auth request failed.');
    }
  };

  return (
    <section>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
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
      <pre>{result}</pre>
    </section>
  );
}
