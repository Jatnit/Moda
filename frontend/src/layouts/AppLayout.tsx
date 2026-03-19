import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

export function AppLayout() {
  const [headerTitle, setHeaderTitle] = useState('Moda');
  const [bannerText, setBannerText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [themeColor, setThemeColor] = useState('#114a9f');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'}/settings`)
      .then((res) => res.json())
      .then((rows: Array<{ key: string; value: unknown }>) => {
        const get = (key: string) => rows.find((item) => item.key === key)?.value as any;
        setHeaderTitle(String(get('header_config')?.title ?? 'Moda'));
        setBannerText(String(get('banner_config')?.text ?? ''));
        setFooterText(String(get('footer_config')?.text ?? ''));
        setContactEmail(String(get('contact_info')?.email ?? ''));
        setThemeColor(String(get('theme_tokens')?.primaryColor ?? '#114a9f'));
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="shell" style={{ ['--primary' as any]: themeColor }}>
      <header className="topbar">
        <h1>{headerTitle}</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/auth">Auth</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/admin/settings">Settings</Link>
          <Link to="/admin/builder">Builder</Link>
          <Link to="/admin/media">Media</Link>
        </nav>
      </header>
      {bannerText ? <div className="site-banner">{bannerText}</div> : null}
      <main className="content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>{footerText}</p>
        <p>{contactEmail}</p>
      </footer>
    </div>
  );
}
